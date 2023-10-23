import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import * as OldSchema from '../drizzle/schema';
import * as newSchema from './drizzle/schema';
import { readFileSync } from 'fs';
import { PG_CONNECTION } from './constants';
import { DbType } from './drizzle/drizzle.module';
import { sql } from 'drizzle-orm';

export class TempService implements OnModuleInit {
  private logger = new Logger('TempService');

  constructor(@Inject(PG_CONNECTION) private readonly db: DbType) {}

  async onModuleInit() {
    const profiles = JSON.parse(
      readFileSync('./src/temp/Profile.json', 'utf-8')
    ) as (typeof OldSchema.profile.$inferSelect)[];

    this.logger.log('profiles.length: ' + profiles.length);

    const vouches = JSON.parse(
      readFileSync('./src/temp/Vouchs.json', 'utf-8')
    ) as (typeof OldSchema.vouchs.$inferSelect)[];

    this.logger.log('vouches.length: ' + vouches.length);

    const newProfiles = profiles.map((profile) =>
      this.profileToNewSchema(profile)
    );

    const newVouches = vouches.map((vouch) => this.vouchToNewSchema(vouch));

    // clear current database
    await this.db.execute(sql`TRUNCATE TABLE "Profile" CASCADE;`);
    await this.db.execute(sql`TRUNCATE TABLE "Vouch" CASCADE;`);

    // insert new data
    const insertedProfiles = await this.db
      .insert(newSchema.profile)
      .values(newProfiles)
      .returning();

    const insertedVouches = await this.db
      .insert(newSchema.vouch)
      .values(newVouches)
      .returning();

    this.logger.log('insertedProfiles.length: ' + insertedProfiles.length);
    this.logger.log('insertedVouches.length: ' + insertedVouches.length);
  }

  profileToNewSchema(
    profile: typeof OldSchema.profile.$inferSelect
  ): typeof newSchema.profile.$inferSelect {
    {
      const newProfileStatusMap: Record<
        (typeof OldSchema.profileStatus.enumValues)[number],
        (typeof newSchema.profileStatus.enumValues)[number]
      > = {
        GOOD: 'GOOD',
        SCAMMER: 'SCAMMER',
        WARN: 'DEAL_WITH_CAUTION'
      };
      return {
        alternative: '',
        badges: profile.badges ? profile.badges.join(',') : '',
        banner: profile.banner ?? '',
        color: profile.color,
        createdAt: new Date(profile.createdAt),
        customAvatar: null,
        forum: profile.forum ?? 'Set your forum',
        id: profile.id,
        importedVouches: profile.importedVouches,
        positiveVouches: profile.positiveVouches,
        latestComments: '',
        mark:
          profile.markedAt && profile.markedBy
            ? {
                at: new Date(profile.markedAt),
                by: profile.markedBy,
                for: profile.markedFor
              }
            : ({} as any),
        warning:
          profile.warningAt && profile.warningBy
            ? {
                at: new Date(profile.warningAt),
                by: profile.warningBy,
                reason: profile.waringReason
              }
            : ({} as any),

        products: profile.products ?? 'Set your products',
        profileStatus: newProfileStatusMap[profile.profileStatus],
        role: profile.role,
        shop: profile.shop ?? 'Set your shop',
        username: profile.username,
        userId: profile.userId
      };
    }
  }

  vouchToNewSchema(
    vouch: typeof OldSchema.vouchs.$inferSelect
  ): typeof newSchema.vouch.$inferSelect {
    const vouchStatusMap: Record<
      (typeof OldSchema.vouchStatus.enumValues)[number],
      (typeof newSchema.vouchStatus.enumValues)[number]
    > = {
      APPROVED: 'APPROVED',
      DENIED: 'DENIED',
      PENDING_PROOF: 'PENDING_PROOF_RECEIVER',
      UNCHECKED: 'UNCHECKED'
    };

    return {
      id: vouch.id,
      vouchStatus: vouchStatusMap[vouch.vouchStatus],
      activities:
        vouch.controlledAt && vouch.controlledBy
          ? [
              {
                at: new Date(vouch.controlledAt),
                staffId: vouch.controlledBy,
                activity: vouchStatusMap[vouch.vouchStatus],
                staffName: vouch.controlledBy,
                vouchId: vouch.id,
                reason: vouch.deniedReason
              }
            ]
          : [],
      client: 'shinex',
      comment: vouch.comment,
      createdAt: new Date(vouch.createdAt),
      customData: {
        SHINEX_CONTROLLER_MESSAGE_ID: vouch.controllerMessageId
      },
      deniedReason: vouch.deniedReason,
      receiverId: vouch.receiverId,
      receiverName: vouch.receiverName,
      serverId: vouch.serverId,
      serverName: vouch.serverId,
      voucherId: vouch.voucherId,
      voucherName: vouch.voucherName
    };
  }
}
