/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { Collection } from 'discord.js';
import { eq } from 'drizzle-orm';
import { PgInsertValue } from 'drizzle-orm/pg-core';
import { PG_CONNECTION } from '../constants';
import { DbType } from '../drizzle/drizzle.module';
import { profile, vouch } from '../drizzle/schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  Events,
  ProfileCreatedEvent,
  VouchUpdatedEvent
} from '../events/events';
import { getPreviousFridayDate } from '../utils/getTime';

type ProfileRegisterOptions = {
  userId: string;
  username: string;
};

@Injectable()
export class ProfileService implements OnModuleInit {
  private cache = new Collection<string, typeof profile.$inferSelect>();
  private topLeaderboard = new Collection<
    string,
    typeof profile.$inferSelect
  >();
  private hotLeaderboard = new Collection<
    string,
    typeof profile.$inferSelect & { weeklyVouches: number }
  >();
  private logger = new Logger(ProfileService.name);
  private lastProfileId = 0;

  constructor(
    @Inject(PG_CONNECTION) private readonly db: DbType,
    private eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    this.logger.log('ProfileService has been initialized.');
    const starting = new Date();

    const result = await this.db.select().from(profile);

    this.logger.log('Cached: ' + result.length + ' profiles.');
    this.logger.log('Took:' + (new Date().getTime() - starting.getTime()));

    for (const profile of result) {
      this.cache.set(profile.userId, profile);
      if (profile.id > this.lastProfileId) this.lastProfileId = profile.id;
    }

    const top = result
      .sort(
        (a, b) =>
          b.positiveVouches +
          b.importedVouches -
          a.positiveVouches +
          a.importedVouches
      )
      .filter(
        (p) =>
          p.profileStatus !== 'BLACKLISTED' &&
          p.profileStatus !== 'SCAMMER' &&
          p.profileStatus !== 'BLOCKED'
      )
      .slice(0, 10);

    this.topLeaderboard.clear();
    for (const profile of top) {
      this.topLeaderboard.set(profile.userId, profile);
    }
    this.refreshHotLeaderboard();
  }

  private async dbRegisterProfile(values: PgInsertValue<typeof profile>[]) {
    const starting = new Date();

    const notRegistered = values.filter(
      (value) => !this.cache.has(value.userId as string)
    );

    if (notRegistered.length === 0) {
      return [];
    }

    if (notRegistered.find((value) => !value.username)) {
      return [];
    }

    const result = await this.db
      .insert(profile)
      .values(notRegistered)
      .returning();

    for (const profile of result) {
      this.cache.set(profile.userId, profile);
      if (profile.id > this.lastProfileId) this.lastProfileId = profile.id;
    }

    this.logger.log(
      'Register Took: ' + (new Date().getTime() - starting.getTime()) + 'ms'
    );
    this.logger.log('Registered: ' + result.length + ' profiles.');

    this.eventEmitter.emit(
      Events.ProfileCreated,
      new ProfileCreatedEvent(result)
    );

    return result;
  }

  private async dbUpdateProfile(
    { userId, username }: ProfileRegisterOptions,
    profileData: Partial<typeof profile.$inferSelect>
  ) {
    const starting = new Date();

    await this.getProfile(userId, username, true);

    const oldProfile = this.cache.get(userId);

    const result = await this.db
      .update(profile)
      .set(profileData)
      .where(eq(profile.userId, userId))
      .returning()
      .catch((e) => {
        console.log(e);
        return [];
      });

    this.cache.set(userId, result[0]);

    this.logger.log(
      'Update Took: ' + (new Date().getTime() - starting.getTime()) + 'ms'
    );
    this.logger.log('Updated: ' + result.length + ' profiles.');

    this.eventEmitter.emit(Events.ProfileUpdated, {
      oldProfile,
      newProfile: result[0]
    });

    return result;
  }

  @OnEvent(Events.ProfileUpdated)
  async refreshLeaderboard() {
    const allProfiles = await this.db.select().from(profile);
    const top = allProfiles
      .sort(
        (a, b) =>
          b.positiveVouches +
          b.importedVouches -
          a.positiveVouches +
          a.importedVouches
      )
      .filter(
        (p) =>
          p.profileStatus !== 'BLACKLISTED' &&
          p.profileStatus !== 'SCAMMER' &&
          p.profileStatus !== 'BLOCKED'
      )
      .slice(0, 10);

    this.topLeaderboard.clear();
    for (const profile of top) {
      this.topLeaderboard.set(profile.userId, profile);
    }
  }

  @OnEvent(Events.VouchUpdated)
  private async OnVouchUpdateHandler(payload: VouchUpdatedEvent) {
    if (
      payload.newVouch.vouchStatus === 'APPROVED' ||
      payload.newVouch.vouchStatus === 'APPROVED_WITH_PROOF'
    ) {
      this.refreshHotLeaderboard();
    }
  }

  async refreshHotLeaderboard() {
    const starting = new Date();

    const allVouches = await this.db.select().from(vouch);
    const allProfiles = await this.db.select().from(profile);

    const hot = allProfiles.map((profile) => {
      const weeklyVouches = allVouches.filter(
        (vouch) =>
          vouch.receiverId === profile.userId &&
          vouch.createdAt.getTime() > getPreviousFridayDate().getTime()
      ).length;

      return {
        ...profile,
        weeklyVouches
      };
    });

    const top = hot
      .sort((a, b) => b.weeklyVouches - a.weeklyVouches)
      .filter(
        (p) =>
          p.profileStatus !== 'BLACKLISTED' &&
          p.profileStatus !== 'SCAMMER' &&
          p.profileStatus !== 'BLOCKED'
      )
      .slice(0, 10);

    this.hotLeaderboard.clear();
    for (const profile of top) {
      this.hotLeaderboard.set(profile.userId, profile);
    }

    this.logger.log(
      'Hot Refresh Took: ' + (new Date().getTime() - starting.getTime()) + 'ms'
    );
  }

  registerProfile(ids: ProfileRegisterOptions[], instant = false) {
    if (instant) {
      this.dbRegisterProfile(ids);
      return ids.map(
        (id) => this.cache.get(id.userId) || this.decoyProfile(id)
      );
    } else {
      return this.dbRegisterProfile(ids);
    }
  }

  decoyProfile(id: ProfileRegisterOptions): typeof profile.$inferSelect {
    return {
      id: ++this.lastProfileId,
      userId: id.userId,
      username: id.username,
      customAvatar: null,
      badges: '',
      banner: null,
      color: null,
      createdAt: new Date(), // Use new Date() to get the current date
      forum: 'Set your forum',
      importedVouches: 0,
      latestComments: '',
      mark: {
        at: new Date(),
        by: '',
        for: ''
      },
      warning: {
        at: new Date(),
        by: '',
        reason: ''
      },
      positiveVouches: 0,
      products: 'Set your products',
      profileStatus: 'GOOD',
      role: 'USER',
      shop: 'Set your shop',
      alternative: ''
    };
  }

  getProfile(userId: string, username?: string, instant = true) {
    return (
      this.cache.get(userId) ||
      this.registerProfile([{ userId, username }], instant)[0]
    );
  }

  getTop10() {
    return this.topLeaderboard.toJSON();
  }

  getHot10() {
    return this.hotLeaderboard.toJSON();
  }

  updateProfile(
    userId: string,
    username: string,
    profileData: Partial<typeof profile.$inferSelect>,
    instant = false
  ) {
    let current = this.getProfile(userId);
    if (!current) {
      current = this.decoyProfile({ userId, username });
      delete current.id;
    }
    const updated = this.mergeAndValidate(current, profileData);

    // compare the current and updated profile
    if (JSON.stringify(current) === JSON.stringify(updated)) {
      this.logger.log('Profile is the same. Skipping update.');
      return updated;
    }

    if (instant) {
      this.dbUpdateProfile({ userId, username }, profileData);
      this.cache.set(userId, updated);
      return updated;
    } else {
      return this.dbUpdateProfile({ userId, username }, profileData);
    }
  }

  mergeAndValidate(
    current: typeof profile.$inferSelect,
    updated: Partial<typeof profile.$inferSelect> | any
  ): typeof profile.$inferSelect {
    // validate if type is correct typeof profile.$inferSelect and not null remove any other properties
    for (const key in updated) {
      if (
        updated[key] &&
        (!profile[key]?.dataType ||
          typeof updated[key] !== profile[key].dataType) &&
        !['warning', 'mark'].includes(key)
      ) {
        delete updated[key];
      }
    }

    // merge the current and updated profile
    const merged = { ...current, ...updated };
    return merged;
  }

  searchProduct(query: string) {
    const allProfiles = this.cache.toJSON();

    const profileSearchRegex = new RegExp(query, 'igm');
    const results = allProfiles.filter((profile) => {
      return profile.products.match(profileSearchRegex);
    });

    return results.slice(0, 20);
  }

  // async transferProfileOwnership(
  //   fromId: ProfileRegisterOptions,
  //   toID: ProfileRegisterOptions
  // ) {
  //   const fromProfile = await this.getProfile(
  //     fromId.userId,
  //     fromId.username,
  //     true
  //   );

  //   const toProfile = await this.getProfile(toID.userId, toID.username, true);
  // }
}
