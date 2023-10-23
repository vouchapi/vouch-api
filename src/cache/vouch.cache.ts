/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpException, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Collection } from 'discord.js';
import { eq } from 'drizzle-orm';
import { PgInsertValue } from 'drizzle-orm/pg-core';
import { PG_CONNECTION } from '../constants';
import { DbType } from '../drizzle/drizzle.module';
import { VouchActivity, profile, vouch } from '../drizzle/schema';
import { ProfileService } from './profile.cache';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events, VouchCreatedEvent, VouchUpdatedEvent } from '../events/events';

export interface VouchesFetchOptions {
  vouchId?: string;
  status?: string;
  receiverId?: string;
  senderId?: string;
  limit?: string;
  sortBy?: string;
}

export class VouchService implements OnModuleInit {
  private cache = new Collection<number, typeof vouch.$inferSelect>();
  private logger = new Logger(VouchService.name);
  private lastVouchId = 0;

  constructor(
    @Inject(PG_CONNECTION) private readonly db: DbType,
    private readonly profileService: ProfileService,
    private eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    this.logger.log('VouchService has been initialized.');
    const starting = new Date();

    const result = await this.db.select().from(vouch);

    this.logger.log('Cached: ' + result.length + ' vouches.');
    this.logger.log('Took:' + (new Date().getTime() - starting.getTime()));

    for (const vouch of result) {
      this.cache.set(vouch.id as number, vouch);
      if (vouch.id > this.lastVouchId) this.lastVouchId = vouch.id;
    }

    this.logger.log('Last vouch id: ' + this.lastVouchId);
  }

  private async dbUpdateVouch(
    id: number,
    vouchData: Partial<typeof vouch.$inferSelect>
  ) {
    const starting = new Date();

    const oldVouch = this.cache.get(id);

    const result = await this.db
      .update(vouch)
      .set(vouchData)
      .where(eq(vouch.id, id))
      .returning();

    this.cache.set(result[0].id as number, result[0]);

    this.logger.log(
      'Update Took: ' + (new Date().getTime() - starting.getTime()) + 'ms'
    );
    this.logger.log('Updated: ' + result.length + ' vouches.');

    this.eventEmitter.emit(
      Events.VouchUpdated,
      new VouchUpdatedEvent(oldVouch, result[0])
    );

    return result[0];
  }

  updateVouch(
    id: number,
    vouchData: Partial<typeof vouch.$inferSelect>,
    instant = false
  ) {
    const current = this.cache.get(id);
    if (!current) return new HttpException('Vouch not found', 404);

    const merged = this.mergeAndValidate(current, vouchData);
    if (merged instanceof HttpException) {
      return merged;
    }

    if (vouchData.vouchStatus === current.vouchStatus) {
      return new HttpException(
        'Vouch is already ' + vouchData.vouchStatus,
        400
      );
    }

    if (vouchData.vouchStatus === 'UNCHECKED') {
      return new HttpException('Vouch status cannot be UNCHECKED', 400);
    }

    if (current.vouchStatus === 'APPROVED' && merged.vouchStatus === 'DENIED') {
      return new HttpException('Vouch already approved cannot be denied', 400);
    }
    if (
      current.vouchStatus === 'APPROVED' &&
      (merged.vouchStatus === 'PENDING_PROOF_RECEIVER' ||
        merged.vouchStatus === 'PENDING_PROOF_VOUCHER')
    ) {
      return new HttpException(
        'Vouch already approved cannot be asked proof',
        400
      );
    }

    if (instant) {
      this.dbUpdateVouch(id, vouchData);
      return merged;
    } else {
      return this.dbUpdateVouch(id, vouchData);
    }
  }

  async dbPostVouch(
    vouchData: PgInsertValue<typeof vouch>
  ): Promise<typeof vouch.$inferSelect | HttpException> {
    const starting = new Date();

    const vouchDataValidated = this.validateVouch(vouchData);

    if (vouchDataValidated instanceof HttpException) {
      return vouchDataValidated;
    }

    const result = await this.db
      .insert(vouch)
      .values(vouchDataValidated)
      .returning();

    // @ts-ignore
    this.cache.set(result[0].id as number, result[0]);

    this.logger.log(
      'Insert Took: ' + (new Date().getTime() - starting.getTime()) + 'ms'
    );
    this.logger.log('Inserted: ' + result.length + ' vouches.');

    if (this.lastVouchId < result[0].id) {
      this.lastVouchId = result[0].id;
    }

    this.eventEmitter.emit(
      Events.VouchCreated,
      new VouchCreatedEvent(result[0])
    );

    return result[0];
  }

  getVouch(id: number): typeof vouch.$inferSelect {
    return this.cache.get(id);
  }

  async postVouch(
    vouchData: PgInsertValue<typeof vouch>,
    instant = true
  ): Promise<typeof vouch.$inferSelect | HttpException> {
    const vouchDataValidated = this.validateVouch(vouchData);

    if (vouchDataValidated instanceof HttpException) {
      return vouchDataValidated;
    }

    await this.profileService.getProfile(
      vouchDataValidated.receiverId as string,
      vouchDataValidated.receiverName as string,
      false
    );

    if (instant) {
      this.dbPostVouch(vouchDataValidated);
      return this.decoyVouch(vouchDataValidated);
    } else {
      return this.dbPostVouch(vouchDataValidated);
    }
  }

  validateVouch(
    vouchData: PgInsertValue<typeof vouch>
  ): typeof vouchData | HttpException {
    const requiredKeys = Object.entries(vouch).filter(([, value]) => {
      return value && value.notNull && !value.hasDefault;
    });

    const missingKeys = requiredKeys.filter(([key]) => {
      return !vouchData[key];
    });

    if (missingKeys.length > 0) {
      return new HttpException(
        'Missing required keys: ' + missingKeys.map(([key]) => key).join(', '),
        400
      );
    }

    const invalidKeys = Object.entries(vouch).filter(([, value]) => {
      return value && value.notNull && !value.hasDefault;
    });

    const invalidKeysData = invalidKeys.filter(([key, value]) => {
      return typeof vouchData[key] !== value.dataType;
    });

    if (invalidKeysData.length > 0) {
      return new HttpException(
        'Invalid keys: ' +
          invalidKeysData
            .map(([key, value]) => key + ' should be ' + value.type)
            .join(', '),
        400
      );
    }

    vouchData.comment = this.refineString(vouchData.comment as string);

    return vouchData;
  }

  getProfileVouches(id: string): (typeof vouch.$inferSelect)[] {
    return this.cache.filter((vouch) => vouch.receiverId === id).toJSON();
  }

  getVouches(query?: VouchesFetchOptions): (typeof vouch.$inferSelect)[] {
    let vouches = this.cache.toJSON();
    if (query) {
      if (typeof query.vouchId === 'string') {
        const vouchIds = query.vouchId.split(',');
        vouches = vouches.filter((vouch) => vouchIds.includes(vouch.id + ''));
      }
      if (typeof query.status === 'string') {
        vouches = vouches.filter((vouch) => vouch.vouchStatus === query.status);
      }
      if (typeof query.receiverId === 'string') {
        vouches = vouches.filter(
          (vouch) => vouch.receiverId === query.receiverId
        );
      }
      if (typeof query.senderId === 'string') {
        vouches = vouches.filter((vouch) => vouch.voucherId === query.senderId);
      }
      if (query.sortBy && ['createdAt', 'id'].includes(query.sortBy)) {
        if (query.sortBy === 'createdAt') {
          vouches = vouches.sort((a, b) => {
            return a.createdAt.getTime() - b.createdAt.getTime();
          });
        } else {
          vouches = vouches.sort((a, b) => {
            return a.id - b.id;
          });
        }
      }
      if (typeof query.limit === 'string' && /[\d]+/g.test(query.limit)) {
        vouches = vouches.slice(0, parseInt(query.limit));
      }
    }
    return vouches;
  }

  getHot10() {
    // most approved vouches in this week
    const vouches = this.cache.toJSON();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const hotVouches = vouches.filter((vouch) => vouch.createdAt > weekAgo);
    const merged = hotVouches.reduce(
      (acc, vouch) => {
        if (acc[vouch.receiverId]) {
          acc[vouch.receiverId].push(vouch);
        } else {
          acc[vouch.receiverId] = [vouch];
        }
        return acc;
      },
      {} as Record<string, (typeof vouch.$inferSelect)[]>
    );
    const hotVouchesCount = Object.entries(merged).map(([key, value]) => {
      return {
        id: key,
        username: value[0].receiverName,
        count: value.length
      };
    });
    const sorted = hotVouchesCount.sort((a, b) => b.count - a.count);
    const top10 = sorted.slice(0, 10);
    return top10;
  }

  async approveVouch(
    { vouchId, staffId, staffName, client }: VouchActivity,
    withProof = false
  ) {
    const validate = this.validateVouchActivity({
      vouchId,
      staffId,
      staffName,
      activity: withProof ? 'APPROVED_WITH_PROOF' : 'APPROVED',
      client
    });

    if (validate instanceof HttpException) {
      return validate;
    }

    const vouch = await this.updateVouch(
      vouchId,
      {
        vouchStatus: withProof ? 'APPROVED_WITH_PROOF' : 'APPROVED',
        activities: [
          ...(this.cache.get(vouchId)?.activities || []),
          {
            vouchId,
            staffId,
            staffName,
            client,
            activity: withProof ? 'APPROVED_WITH_PROOF' : 'APPROVED',
            at: new Date()
          }
        ]
      },
      true
    );

    if (vouch instanceof HttpException) {
      return vouch;
    }

    const currentProfile = this.profileService.getProfile(
      vouch.receiverId,
      vouch.receiverName,
      true
    ) as typeof profile.$inferSelect;

    const latestComments =
      currentProfile.latestComments === ''
        ? []
        : currentProfile.latestComments.split(',');
    latestComments.reverse();
    latestComments.push(vouch.comment);
    latestComments.slice(0, 5);
    latestComments.reverse();

    const updateProfileData = {
      positiveVouches: currentProfile.positiveVouches + 1,
      latestComments: latestComments.join(',')
    };

    await this.profileService.updateProfile(
      vouch.receiverId,
      vouch.receiverName,
      updateProfileData,
      true
    );
    return vouch;
  }

  denyVouch({ vouchId, staffId, staffName, client, reason }: VouchActivity) {
    const validate = this.validateVouchActivity({
      vouchId,
      staffId,
      staffName,
      activity: 'DENIED',
      client
    });

    if (validate instanceof HttpException) {
      return validate;
    }

    return this.updateVouch(vouchId, {
      vouchStatus: 'DENIED',
      deniedReason: reason,
      activities: [
        ...(this.cache.get(vouchId)?.activities || []),
        {
          vouchId,
          staffId,
          staffName,
          client,
          reason,
          activity: 'DENIED',
          at: new Date()
        }
      ]
    });
  }

  askProofVouch({
    vouchId,
    staffId,
    staffName,
    client,
    who
  }: VouchActivity & {
    who: 'RECEIVER' | 'VOUCHER';
  }) {
    const status =
      who === 'RECEIVER' ? 'PENDING_PROOF_RECEIVER' : 'PENDING_PROOF_VOUCHER';
    const validate = this.validateVouchActivity(
      {
        vouchId,
        staffId,
        staffName,
        activity: status,
        client,
        who
      },
      true
    );

    if (validate instanceof HttpException) {
      return validate;
    }

    return this.updateVouch(vouchId, {
      vouchStatus: status,
      activities: [
        ...(this.cache.get(vouchId)?.activities || []),
        {
          vouchId,
          staffId,
          staffName,
          client,
          activity: status,
          at: new Date()
        }
      ]
    });
  }

  decoyVouch(
    vouchData: PgInsertValue<typeof vouch>
  ): typeof vouch.$inferSelect {
    return {
      comment: vouchData.comment as string,
      receiverId: vouchData.receiverId as string,
      receiverName: vouchData.receiverName as string,
      vouchStatus: 'UNCHECKED',
      voucherId: vouchData.voucherId as string,
      voucherName: vouchData.voucherName as string,
      serverId: vouchData.serverId as string,
      serverName: vouchData.serverName as string,
      id: ++this.lastVouchId,
      createdAt: new Date(),
      activities: [],
      customData: {},
      client: (vouchData.client || '') as string,
      deniedReason: null
    };
  }

  mergeAndValidate(
    current: typeof vouch.$inferSelect,
    updated: Partial<typeof vouch.$inferSelect>
  ) {
    const merged = { ...current, ...updated };

    const requiredKeys = Object.entries(vouch).filter(([, value]) => {
      return value && value.notNull && !value.hasDefault;
    });

    const missingKeys = requiredKeys.filter(([key]) => {
      return !merged[key];
    });

    if (missingKeys.length > 0) {
      return new HttpException(
        'Missing required keys: ' + missingKeys.map(([key]) => key).join(', '),
        400
      );
    }

    const invalidKeys = Object.entries(vouch).filter(([, value]) => {
      return value && value.notNull && !value.hasDefault;
    });

    const invalidKeysData = invalidKeys.filter(([key, value]) => {
      return typeof merged[key] !== value.dataType;
    });

    if (invalidKeysData.length > 0) {
      return new HttpException(
        'Invalid keys: ' +
          invalidKeysData
            .map(([key, value]) => key + ' should be ' + value.type)
            .join(', '),
        400
      );
    }

    return merged;
  }

  validateVouchActivity(
    data: Partial<VouchActivity & { who: 'RECEIVER' | 'VOUCHER' }>,
    who = false
  ) {
    const requiredKeys = ['vouchId', 'staffId', 'staffName', 'activity'];

    if (who) {
      requiredKeys.push('who');
    }

    const missingKeys = requiredKeys.filter((key) => {
      return !data[key];
    });

    if (missingKeys.length > 0) {
      return new HttpException(
        'Missing required keys: ' + missingKeys.join(', '),
        400
      );
    }

    const types = {
      vouchId: 'number',
      staffId: 'string',
      staffName: 'string',
      activity: 'string',
      who: 'string',
      client: 'string'
    };

    const invalidKeysData = Object.entries(types).filter(([key, type]) => {
      return typeof data[key] !== type && data[key];
    });

    if (invalidKeysData.length > 0) {
      return new HttpException(
        'Invalid keys: ' +
          invalidKeysData
            .map(([key, value]) => key + ' should be ' + value)
            .join(', '),
        400
      );
    }

    return data;
  }

  refineString(input: string): string {
    // Replace commas and colons with an empty string
    const refinedString = input.replace(
      /[,\u200B\u200C\u200D\u200E\u200F\u202A-\u202E\n]/g,
      ''
    );

    return refinedString.trim();
  }

  importTxtToVouches(
    file: string,
    receiverId: string,
    receiverName: string,
    clinet: 'SHIBA' | 'AXTER' | 'REPIFY' | string
  ) {
    switch (clinet) {
      case 'SHIBA': {
        const vouches = file.split('---------');

        const vouchData = [];

        for (const vouch of vouches) {
          const lines = vouch.split('\n');
          const comment = lines[2].replace('Comment: ', '').trim();
          const voucher = lines[2]
            .replace('Reviewer: ', '')
            .trim()
            .split('#')[0];
          const time = new Date(lines[3].replace('Time: ', '').trim());
          vouchData.push({
            comment,
            time,
            voucher
          });
        }

        const vouchDbData: PgInsertValue<typeof vouch>[] = vouchData.map(
          (vouch) => {
            return {
              userId: receiverId,
              comment: vouch.comment,
              voucherId: vouch.voucher,
              voucherName: vouch.voucher,
              receiverId: receiverId,
              receiverName: receiverName,
              serverId: 'IMP SHIBA',
              serverName: 'IMP SHIBA',
              vouchStatus: 'APPROVED',
              activities: [],
              customData: {},
              deniedReason: null,
              createdAt: vouch.time
            };
          }
        );
        return vouchDbData;
      }
      case 'AXTER':
        return [];
      case 'REPIFY':
        return [];
      default:
        return [];
    }
  }
}
