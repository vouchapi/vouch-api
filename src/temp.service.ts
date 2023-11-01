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
    return;
    this.recoverVouches();

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

  recoverVouches() {
    const vouches = [
      {
        id: '260',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [11.8$] BKASH-BD TO LTC',
        createdAt: '2023-11-01T07:39:27.441Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1169178881392128010'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1167488997715607634',
        serverName: 'BAZAREX | VOUCHES',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '259',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.4K BDT] LTC TO BKASH-BD',
        createdAt: '2023-10-31T18:31:00.995Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168980463843553400'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1167488997715607634',
        serverName: 'BAZAREX | VOUCHES',
        voucherId: '671235142651740160',
        voucherName: 'xm8.xyz'
      },
      {
        id: '258',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [4$] BKASH-BD TO LTC',
        createdAt: '2023-10-31T18:22:11.795Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168978244511477761'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1167488997715607634',
        serverName: 'BAZAREX | VOUCHES',
        voucherId: '1167684955632041984',
        voucherName: 'shimanto0157'
      },
      {
        id: '257',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [3.60$] BKASH-BD TO LTC',
        createdAt: '2023-10-31T18:21:38.661Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168978105285738598'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1167488997715607634',
        serverName: 'BAZAREX | VOUCHES',
        voucherId: '1167684955632041984',
        voucherName: 'shimanto0157'
      },
      {
        id: '256',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1200₹] UPI-IND TO BKASH-BD',
        createdAt: '2023-10-31T18:21:10.173Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168977985525788764'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1167488997715607634',
        serverName: 'BAZAREX | VOUCHES',
        voucherId: '1167684955632041984',
        voucherName: 'shimanto0157'
      },
      {
        id: '255',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [4400₹] UPI-IND TO BKASH-BD',
        createdAt: '2023-10-31T18:20:53.991Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168977917951352912'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1167488997715607634',
        serverName: 'BAZAREX | VOUCHES',
        voucherId: '1167684955632041984',
        voucherName: 'shimanto0157'
      },
      {
        id: '254',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [10$] BKASH-BD TO LTC',
        createdAt: '2023-10-31T18:09:43.223Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168975104219283518'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1167488997715607634',
        serverName: 'BAZAREX | VOUCHES',
        voucherId: '1167684955632041984',
        voucherName: 'shimanto0157'
      },
      {
        id: '253',
        client: 'shinex',
        comment: 'Legit Got 1x Nitro Boost Lyf For 250₹ | Tysm M1x!',
        createdAt: '2023-10-31T16:09:27.159Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168944837555396680'
        },
        receiverId: '866576187581267988',
        receiverName: 'sharpn3ss',
        serverId: '1166050786732683285',
        serverName: 'Shoppe Savvy',
        voucherId: '1095937708532183040',
        voucherName: 'darkdevil7176'
      },
      {
        id: '252',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [7.4$] BKASH-BD TO LTC',
        createdAt: '2023-10-31T15:43:19.120Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168938261092237385'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '991933502402600981',
        voucherName: 'realm1x'
      },
      {
        id: '251',
        client: 'shinex',
        comment:
          'bought 1k Discord Members for 150tk . Highly recommended. Thanks @! TRExPeLePeW',
        createdAt: '2023-10-31T12:03:17.306Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168882888796819487'
        },
        receiverId: '491541325355810816',
        receiverName: 'pelepew',
        serverId: '1136457377030340608',
        serverName: 'The RoyaL Store',
        voucherId: '1124649708397264966',
        voucherName: '07_rahi'
      },
      {
        id: '253',
        client: 'shinex',
        comment: 'Bought 28x Server Boosts ( 1 Month ) for 640tk | Legit',
        createdAt: '2023-10-29T17:00:03.109Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168232796259631114'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '732115921216340049',
        voucherName: 'PRESIDENT'
      },
      {
        id: '252',
        client: 'shinex',
        comment:
          'Got Server Setup  8x Server Boosts ( 1 Month ) and 1k Online Members for 550tk | Legit',
        createdAt: '2023-10-29T16:46:43.009Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168229439704932433'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '732115921216340049',
        voucherName: 'PRESIDENT'
      },
      {
        id: '251',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [700₹] UPI-IND TO BKASH-BD',
        createdAt: '2023-10-29T16:41:22.774Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168228096604905537'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '991933502402600981',
        voucherName: 'realm1x'
      },
      {
        id: '252',
        client: 'shinex',
        comment: 'Bought Nitro 1x Claim Vcc For 1$ | Legit',
        createdAt: '2023-10-29T15:15:12.216Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168206409960276038'
        },
        receiverId: '982894164620480562',
        receiverName: 'halal_talha',
        serverId: '1127975330263601172',
        serverName: 'Simpi Mart',
        voucherId: '1093006625465446460',
        voucherName: 'king_hu_xd'
      },
      {
        id: '251',
        client: 'shinex',
        comment: '1x Gta 5 account for 4.5$',
        createdAt: '2023-10-29T09:15:48.297Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168115964789915808'
        },
        receiverId: '909642891578712094',
        receiverName: 'farhanahammed',
        serverId: '1136189527451517059',
        serverName: 'AeroMartBD',
        voucherId: '751495792472359023',
        voucherName: '.kirito_sao'
      },
      {
        id: '338',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [2$] BKASH-BD TO USDT',
        createdAt: '2023-10-29T04:10:28.887Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1168039127585923073'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1108291730291310592',
        voucherName: 'endrewop'
      },
      {
        id: '337',
        client: 'shinex',
        comment: '| LEGIT SELLER. GOT 3 MONTH NITRO TOKEN AT $10.',
        createdAt: '2023-10-28T23:25:27.113Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167967397530062888'
        },
        receiverId: '649080883659276307',
        receiverName: 'Gareeeeeb',
        serverId: '982685328928280577',
        serverName: 'shellmonbhai.mysellix.io',
        voucherId: '713781852338389003',
        voucherName: 'shellmonbhai'
      },
      {
        id: '336',
        client: 'shinex',
        comment:
          '| LEGIT SELLER. GOT 12x 3 MONTH NITRO TOKEN AT $10.5 [ BINANCE]',
        createdAt: '2023-10-28T23:25:13.962Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167967342114914354'
        },
        receiverId: '713781852338389003',
        receiverName: 'shellmonbhai',
        serverId: '982685328928280577',
        serverName: 'shellmonbhai.mysellix.io',
        voucherId: '763161062954237965',
        voucherName: 'cmango'
      },
      {
        id: '335',
        client: 'shinex',
        comment:
          '| LEGIT SELLER. GOT 12x 3 MONTH NITRO TOKEN AT $10.5 [ BINANCE]',
        createdAt: '2023-10-28T23:23:59.810Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167967030905938011'
        },
        receiverId: '713781852338389003',
        receiverName: 'shellmonbhai',
        serverId: '982685328928280577',
        serverName: 'shellmonbhai.mysellix.io',
        voucherId: '649080883659276307',
        voucherName: 'Gareeeeeb'
      },
      {
        id: '334',
        client: 'shinex',
        comment:
          '| LEGIT SELLER. GOT 12x 3 MONTH NITRO TOKEN AT $10.5 [ BINANCE]',
        createdAt: '2023-10-28T21:16:48.690Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167935023828172830'
        },
        receiverId: '484655487502123018',
        receiverName: 'rajshahi',
        serverId: '982685328928280577',
        serverName: 'shellmonbhai.mysellix.io',
        voucherId: '713781852338389003',
        voucherName: 'shellmonbhai'
      },
      {
        id: '333',
        client: 'shinex',
        comment:
          '| LEGIT SELLER. GOT 12x 3 MONTH NITRO TOKEN AT $10.5 [ BINANCE]',
        createdAt: '2023-10-28T21:15:47.871Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167934768667693107'
        },
        receiverId: '484655487502123018',
        receiverName: 'rajshahi',
        serverId: '982685328928280577',
        serverName: 'shellmonbhai.mysellix.io',
        voucherId: '713781852338389003',
        voucherName: 'shellmonbhai'
      },
      {
        id: '332',
        client: 'shinex',
        comment:
          '| LEGIT SELLER. GOT 12x 3 MONTH NITRO TOKEN AT $10.5 [ BINANCE]',
        createdAt: '2023-10-28T21:10:00.759Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167933313202278481'
        },
        receiverId: '713781852338389003',
        receiverName: 'shellmonbhai',
        serverId: '982685328928280577',
        serverName: 'shellmonbhai.mysellix.io',
        voucherId: '484655487502123018',
        voucherName: 'rajshahi'
      },
      {
        id: '331',
        client: 'shinex',
        comment:
          '<@909642891578712094> this king just fixed the internet stagnance for meDude deserves a medal',
        createdAt: '2023-10-28T17:06:16.685Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167871975142727750'
        },
        receiverId: '1148688187259113603',
        receiverName: 'foreverswag56m3_90651',
        serverId: '1136189527451517059',
        serverName: 'AeroMartBD',
        voucherId: '1090751668859191396',
        voucherName: 'nightfuckinblade'
      },
      {
        id: '330',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [2300৳] UPI-IND TO BKASH-BD',
        createdAt: '2023-10-28T16:11:01.782Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167858071570219058'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1167684955632041984',
        voucherName: 'shimanto0157'
      },
      {
        id: '329',
        client: 'shinex',
        comment: 'got 1x nitro basic for 80tk.',
        createdAt: '2023-10-28T16:10:37.302Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167857968797200396'
        },
        receiverId: '1117800469499215915',
        receiverName: 'muntasir27',
        serverId: '1127975330263601172',
        serverName: 'Simpi Mart',
        voucherId: '1122919345723539477',
        voucherName: 'itz_antinio_'
      },
      {
        id: '328',
        client: 'shinex',
        comment: 'legit got 2x gmail id for 50 tk',
        createdAt: '2023-10-28T12:23:16.357Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167800754325696704'
        },
        receiverId: '1117800469499215915',
        receiverName: 'muntasir27',
        serverId: '1127975330263601172',
        serverName: 'Simpi Mart',
        voucherId: '837627043483090976',
        voucherName: 'saaib._'
      },
      {
        id: '327',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [4$] BKASH-BD TO LTC',
        createdAt: '2023-10-28T11:20:18.802Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167784910472355852'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1167684955632041984',
        voucherName: 'shimanto0157'
      },
      {
        id: '326',
        client: 'shinex',
        comment: 'Bought 3 Months Nitro promo only 1$ | Legit',
        createdAt: '2023-10-28T10:25:19.498Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167771071995453542'
        },
        receiverId: '834074261869035600',
        receiverName: 'nobita_x_donutsmp',
        serverId: '1119209138153598979',
        serverName: '𝐎𝐖𝐎   𝐄𝐌𝐏𝐈𝐑𝐄   •   𝐆𝐖𝐒   • 𝐄𝐕𝐄𝐍𝐓',
        voucherId: '491541325355810816',
        voucherName: 'pelepew'
      },
      {
        id: '325',
        client: 'shinex',
        comment: '[0.75$] • 500 Online Members',
        createdAt: '2023-10-28T09:40:25.763Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167759773719072828'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '960922446553305100',
        voucherName: 'beast.xd'
      },
      {
        id: '324',
        client: 'shinex',
        comment: '[0.47$] • Exchange • for 67 BDT',
        createdAt: '2023-10-28T08:51:26.554Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167747445799796786'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '960922446553305100',
        voucherName: 'beast.xd'
      },
      {
        id: '323',
        client: 'shinex',
        comment: '[0.6$] • 1000 Offline Members',
        createdAt: '2023-10-28T08:19:28.414Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167739400604626997'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '960922446553305100',
        voucherName: 'beast.xd'
      },
      {
        id: '322',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [100৳] BKASH TO BINANCE',
        createdAt: '2023-10-28T05:54:31.156Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167702921597694033'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '785401941186052106',
        voucherName: 'aizen_sama444'
      },
      {
        id: '321',
        client: 'shinex',
        comment: 'legit got 2x nitro for 120 Tk.',
        createdAt: '2023-10-28T05:40:07.832Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167699300466315304'
        },
        receiverId: '1117800469499215915',
        receiverName: 'muntasir27',
        serverId: '1127975330263601172',
        serverName: 'Simpi Mart',
        voucherId: '1141690177287372882',
        voucherName: '._bankai_.'
      },
      {
        id: '320',
        client: 'shinex',
        comment: 'Bought Among Us (Steam Gift) for 180tk | Legit',
        createdAt: '2023-10-28T04:51:50.712Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167687148628090943'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '1023460434784817172',
        voucherName: 'raiyanhabib'
      },
      {
        id: '319',
        client: 'shinex',
        comment: 'got 1x Nitro Basic For Giveaway',
        createdAt: '2023-10-28T04:06:56.084Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167675847197601832'
        },
        receiverId: '1093006625465446460',
        receiverName: 'king_hu_xd',
        serverId: '1127975330263601172',
        serverName: 'Simpi Mart',
        voucherId: '1122919345723539477',
        voucherName: 'itz_antinio_'
      },
      {
        id: '318',
        client: 'shinex',
        comment: '[200৳] • Netflix 1 Month',
        createdAt: '2023-10-27T19:29:26.886Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167545617166389360'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '1161926755028836427',
        voucherName: 'rawzu0640'
      },
      {
        id: '317',
        client: 'shinex',
        comment: '1x Nitro Basic LYF Link $0.25',
        createdAt: '2023-10-27T18:41:10.206Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167533468142555237'
        },
        receiverId: '1057299639675670568',
        receiverName: 'jatinback',
        serverId: '1163767120333656094',
        serverName: 'JxTin St0cks!🧋',
        voucherId: '930338699877687307',
        voucherName: 'aryan_tiwari'
      },
      {
        id: '316',
        client: 'shinex',
        comment: '2x basic for 0.58$',
        createdAt: '2023-10-27T17:51:45.092Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167521031150379059'
        },
        receiverId: '1048830290744848446',
        receiverName: 'l_o_r_d_d_e_v_l',
        serverId: '1162649237314613270',
        serverName: 'NITRO HEAVEN',
        voucherId: '767108799785598977',
        voucherName: 'm4nix.'
      },
      {
        id: '315',
        client: 'shinex',
        comment: 'legit got 1 month nitro basic for 80 tk.',
        createdAt: '2023-10-27T16:26:21.554Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167499541587705937'
        },
        receiverId: '1117800469499215915',
        receiverName: 'muntasir27',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '837627043483090976',
        voucherName: 'saaib._'
      },
      {
        id: '314',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [215$] BKASH-BD TO LTC',
        createdAt: '2023-10-27T13:24:55.763Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167453883019317318'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1100096790197448724',
        voucherName: '7inc6'
      },
      {
        id: '313',
        client: 'shinex',
        comment: 'Got 1x Nitro Basic For 70TK',
        createdAt: '2023-10-27T12:49:46.236Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167445035126636634'
        },
        receiverId: '1093006625465446460',
        receiverName: 'king_hu_xd',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '1117800469499215915',
        voucherName: 'muntasir27'
      },
      {
        id: '312',
        client: 'shinex',
        comment: 'Bought 1x Nitro basic for 50tk| Legit',
        createdAt: '2023-10-27T12:29:31.003Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167439938107744276'
        },
        receiverId: '982894164620480562',
        receiverName: 'halal_talha',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '1069515672536752149',
        voucherName: 'the_soup_guy49'
      },
      {
        id: '311',
        client: 'shinex',
        comment: 'legit got 1k insta followers for 110Tk.',
        createdAt: '2023-10-27T12:15:57.494Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167436525814939690'
        },
        receiverId: '1117800469499215915',
        receiverName: 'muntasir27',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '940946533459841056',
        voucherName: 'aminur_'
      },
      {
        id: '310',
        client: 'shinex',
        comment: '[1$] • 2x Server Boost 3 Months',
        createdAt: '2023-10-27T11:54:41.223Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167431172834467891'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '909368377364082698',
        voucherName: 'anik.1'
      },
      {
        id: '309',
        client: 'shinex',
        comment: '[1$] • 2x Server Boost 3 Months',
        createdAt: '2023-10-27T11:53:13.103Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167430803333062677'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '987086150600654969',
        voucherName: 'raseen_extra'
      },
      {
        id: '308',
        client: 'shinex',
        comment: 'Got 1x Nitro Basic For 0.55$',
        createdAt: '2023-10-27T11:26:09.517Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167423993440116828'
        },
        receiverId: '1093006625465446460',
        receiverName: 'king_hu_xd',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '880154334497751080',
        voucherName: 'dirrrrrty16'
      },
      {
        id: '307',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [10$] BKASH-BD TO LTC',
        createdAt: '2023-10-27T10:53:45.845Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167415841030160404'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '711223868689481798',
        voucherName: 'heynuo'
      },
      {
        id: '306',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1$] BKASH-BD TO LTC',
        createdAt: '2023-10-27T08:28:54.218Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167379385930756136'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '884829404281319434',
        voucherName: 'zunayed_zuno'
      },
      {
        id: '305',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [405৳] UPI-IND TO NAGAD-BD',
        createdAt: '2023-10-27T06:18:40.241Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167346611559612476'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1137664328661741638',
        voucherName: 'dexaa___'
      },
      {
        id: '304',
        client: 'shinex',
        comment: 'Got 15x 2m Aged Accounts for 1.26$ | Legit',
        createdAt: '2023-10-27T05:58:04.695Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167341428939165740'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '778476656620077087',
        voucherName: 'guackinactive'
      },
      {
        id: '303',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [100৳] BKASH TO NAGAD',
        createdAt: '2023-10-27T05:11:52.756Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167329802823417906'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '875988767742246922',
        voucherName: 'pr4bably_raiyan355'
      },
      {
        id: '302',
        client: 'shinex',
        comment: 'legit got 5x Booster for 5$',
        createdAt: '2023-10-26T20:31:42.071Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167198895537930281'
        },
        receiverId: '1057299639675670568',
        receiverName: 'jatinback',
        serverId: '1163767120333656094',
        serverName: 'JxTin St0cks!🧋',
        voucherId: '469780071339655168',
        voucherName: 'archie.lyy'
      },
      {
        id: '301',
        client: 'shinex',
        comment: 'legit got 30x basic for 3$',
        createdAt: '2023-10-26T20:30:21.860Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167198559666446517'
        },
        receiverId: '1057299639675670568',
        receiverName: 'jatinback',
        serverId: '1163767120333656094',
        serverName: 'JxTin St0cks!🧋',
        voucherId: '333021880128634892',
        voucherName: 'virusisbad'
      },
      {
        id: '300',
        client: 'shinex',
        comment: 'Legit Got 3x Nitro for 3.5$',
        createdAt: '2023-10-26T20:27:20.633Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167197799285280888'
        },
        receiverId: '1057299639675670568',
        receiverName: 'jatinback',
        serverId: '1163767120333656094',
        serverName: 'JxTin St0cks!🧋',
        voucherId: '852609340946251826',
        voucherName: 'amanisop1'
      },
      {
        id: '299',
        client: 'shinex',
        comment: '2x Nitro Basic LYF Link $0.45',
        createdAt: '2023-10-26T18:00:00.853Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167160722321592371'
        },
        receiverId: '1057299639675670568',
        receiverName: 'jatinback',
        serverId: '1163767120333656094',
        serverName: 'JxTin St0cks!🧋',
        voucherId: '803904603581710336',
        voucherName: 'deep.ly'
      },
      {
        id: '298',
        client: 'shinex',
        comment: '[0.30$] • MM HOLD • NITRO BASIC',
        createdAt: '2023-10-26T17:44:45.232Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167156881974894716'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1164980903349600276',
        serverName: 'Middleman ⭐ | Prevent Scams | 🇧🇩',
        voucherId: '983978873085640766',
        voucherName: 'ruman019'
      },
      {
        id: '297',
        client: 'shinex',
        comment: 'legit got 4x nitro basic in $1.04',
        createdAt: '2023-10-26T17:37:39.013Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167155093964062782'
        },
        receiverId: '983978873085640766',
        receiverName: 'ruman019',
        serverId: '1164980903349600276',
        serverName: 'Middleman ⭐ | Prevent Scams | 🇧🇩',
        voucherId: '671235142651740160',
        voucherName: 'xm8.xyz'
      },
      {
        id: '296',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [126৳] UPI-IND TO BKASH-BD',
        createdAt: '2023-10-26T16:59:26.338Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167145478522163270'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1066245355374649425',
        voucherName: 'homes1234'
      },
      {
        id: '295',
        client: 'shinex',
        comment: 'Legit Got 2x Nitro Boost Lyf For 450₹ | Tysm M1x!',
        createdAt: '2023-10-26T13:39:37.691Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167095194085244958'
        },
        receiverId: '866576187581267988',
        receiverName: 'sharpn3ss',
        serverId: '1166050786732683285',
        serverName: 'Shoppe Savvy',
        voucherId: '949552049580806154',
        voucherName: 'og_rup'
      },
      {
        id: '294',
        client: 'shinex',
        comment: '[0.35$] • Nitro Basic',
        createdAt: '2023-10-26T13:26:37.916Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167091923895451648'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '1008735849216737330',
        voucherName: 'rabbybro'
      },
      {
        id: '293',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [3.2$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T13:24:23.310Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167091359220519024'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1073515655795576863',
        voucherName: 'anash08'
      },
      {
        id: '292',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [3000৳] BKASH-BD TO UPI-IND',
        createdAt: '2023-10-26T12:26:14.797Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167076727198056468'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1065959019228954756',
        voucherName: 'monu_warrior'
      },
      {
        id: '291',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T11:17:59.618Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167059551066013706'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '791348920324063273',
        voucherName: 'gangster_boy'
      },
      {
        id: '290',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T11:12:25.424Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167058148780159067'
        },
        receiverId: '834074261869035600',
        receiverName: 'nobita_x_donutsmp',
        serverId: '1119209138153598979',
        serverName: 'O W O EMP!RE﹒ Gws ﹒Events𓂃 ‹3 ˃ ᴗ ˂',
        voucherId: '1073515655795576863',
        voucherName: 'anash08'
      },
      {
        id: '289',
        client: 'shinex',
        comment: 'Got 3 Months Promo Nitro Activation for 260tk | Legit',
        createdAt: '2023-10-26T11:04:37.761Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167056187263561741'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '1059108758652989450',
        voucherName: 'blazeashop'
      },
      {
        id: '288',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [3.54$] NAGAD-BD TO LTC',
        createdAt: '2023-10-26T10:53:56.694Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167053498890866708'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1140287270038024303',
        voucherName: 'ohiotoxic'
      },
      {
        id: '287',
        client: 'shinex',
        comment: 'Bought 1x Nitro basic for 50tk| Legit',
        createdAt: '2023-10-26T09:59:29.413Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167039794774290432'
        },
        receiverId: '982894164620480562',
        receiverName: 'halal_talha',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '1117800469499215915',
        voucherName: 'muntasir27'
      },
      {
        id: '286',
        client: 'shinex',
        comment: 'got 1 month nitro basic for 50tk.',
        createdAt: '2023-10-26T09:58:42.095Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167039595637125192'
        },
        receiverId: '1117800469499215915',
        receiverName: 'muntasir27',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '1122919345723539477',
        voucherName: 'itz_antinio_'
      },
      {
        id: '285',
        client: 'shinex',
        comment: 'Bought 1x Nitro basic for 50tk| Legit',
        createdAt: '2023-10-26T09:56:22.663Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167039011362197547'
        },
        receiverId: '982894164620480562',
        receiverName: 'halal_talha',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '1117800469499215915',
        voucherName: 'muntasir27'
      },
      {
        id: '284',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [2.85$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T09:49:38.374Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167037315860922369'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '283',
        client: 'shinex',
        comment: 'got a nitro gift link 299 taka',
        createdAt: '2023-10-26T09:46:45.428Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167036590330224690'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '1112978881880784901',
        voucherName: 'itzpagalxd'
      },
      {
        id: '282',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [200TK] BKASH-BD TO NAGAD',
        createdAt: '2023-10-26T09:25:33.407Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167031255175549049'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '736621857196867734',
        voucherName: 'nevilahsan.'
      },
      {
        id: '281',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.1$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T09:17:30.044Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167029227305062513'
        },
        receiverId: '834074261869035600',
        receiverName: 'nobita_x_donutsmp',
        serverId: '1119209138153598979',
        serverName: 'O W O EMP!RE﹒ Gws ﹒Events𓂃 ‹3 ˃ ᴗ ˂',
        voucherId: '1073515655795576863',
        voucherName: 'anash08'
      },
      {
        id: '280',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [2$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T09:17:13.804Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167029159705448489'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '671235142651740160',
        voucherName: 'xm8.xyz'
      },
      {
        id: '279',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.9$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T09:12:30.062Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167027969441660949'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '278',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.9$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T09:09:52.738Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167027309723795456'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '277',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.85$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T09:04:13.670Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167025887531769856'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '834074261869035600',
        voucherName: 'nobita_x_donutsmp'
      },
      {
        id: '276',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.2$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T08:17:24.212Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1167014103613706312'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '275',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.3$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T04:00:40.696Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166949496819814493'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1093006625465446460',
        voucherName: 'king_hu_xd'
      },
      {
        id: '274',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.5$] BKASH-BD TO LTC',
        createdAt: '2023-10-26T00:47:23.237Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166900853484027934'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '595297798891765812',
        voucherName: 'not.ur_rabby'
      },
      {
        id: '273',
        client: 'shinex',
        comment: 'nitro basic lyf for 2$',
        createdAt: '2023-10-25T22:09:57.240Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166861233887129650'
        },
        receiverId: '864901438752423937',
        receiverName: 'hardik1472',
        serverId: '1163767120333656094',
        serverName: 'JxTin St0cks!🧋',
        voucherId: '1057299639675670568',
        voucherName: 'jatinback'
      },
      {
        id: '272',
        client: 'shinex',
        comment: 'nitro basic lyf for 2$ ltc',
        createdAt: '2023-10-25T22:09:17.454Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166861066874146868'
        },
        receiverId: '1057299639675670568',
        receiverName: 'jatinback',
        serverId: '1163767120333656094',
        serverName: 'JxTin St0cks!🧋',
        voucherId: '864901438752423937',
        voucherName: 'hardik1472'
      },
      {
        id: '271',
        client: 'shinex',
        comment: '[200৳] • Nitro Boost Gift Link 1 Month',
        createdAt: '2023-10-25T20:23:16.565Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166834387573293067'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '1110518709560299571',
        voucherName: 'js.nihal'
      },
      {
        id: '270',
        client: 'shinex',
        comment: '[500৳] • 8x Discord Server Boost 3 Months',
        createdAt: '2023-10-25T19:46:57.223Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166825246674931812'
        },
        receiverId: '1017466312664035338',
        receiverName: 'raseen_',
        serverId: '1141803200840749177',
        serverName: 'EternaL St0rE ⭐ | CHEAPEST IN BANGLADESH 🇧🇩',
        voucherId: '1110518709560299571',
        voucherName: 'js.nihal'
      },
      {
        id: '269',
        client: 'shinex',
        comment: 'Bought Nitro boost lyf Only 1.7$ | Legit',
        createdAt: '2023-10-25T18:59:54.918Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166813409455652926'
        },
        receiverId: '834074261869035600',
        receiverName: 'nobita_x_donutsmp',
        serverId: '1119209138153598979',
        serverName: 'O W O EMP!RE﹒ Gws ﹒Events𓂃 ‹3 ˃ ᴗ ˂',
        voucherId: '1116601892588507169',
        voucherName: 'warrior_boy__'
      },
      {
        id: '268',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.2$] BKASH-BD TO LTC',
        createdAt: '2023-10-25T18:16:48.290Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166802560737366096'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '267',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [3.15$] BKASH-BD TO LTC',
        createdAt: '2023-10-25T18:11:11.744Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166801148875919532'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '671235142651740160',
        voucherName: 'xm8.xyz'
      },
      {
        id: '266',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [2.4$] BKASH-BD TO LTC',
        createdAt: '2023-10-25T17:58:52.355Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166798047083241523'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '265',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.35$] BKASH-BD TO LTC',
        createdAt: '2023-10-25T17:56:45.272Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166797514524082359'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133345151083884655',
        voucherName: '_karma1415'
      },
      {
        id: '264',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [480৳] UPI-IND TO NAGAD-BD',
        createdAt: '2023-10-25T17:26:19.144Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166789855242633367'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1133099552216461423',
        voucherName: 'maruf.rahman'
      },
      {
        id: '263',
        client: 'shinex',
        comment: 'Bought Nitro Basic lyf Only 0.53$ | Legit',
        createdAt: '2023-10-25T17:15:13.757Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166787063996219483'
        },
        receiverId: '834074261869035600',
        receiverName: 'nobita_x_donutsmp',
        serverId: '1119209138153598979',
        serverName: 'O W O EMP!RE﹒ Gws ﹒Events𓂃 ‹3 ˃ ᴗ ˂',
        voucherId: '923472612468879380',
        voucherName: 'real_iconic_0186'
      },
      {
        id: '262',
        client: 'shinex',
        comment: 'git nitro + token 3.4$',
        createdAt: '2023-10-25T16:28:10.528Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166775222507155479'
        },
        receiverId: '1093006625465446460',
        receiverName: 'king_hu_xd',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '1139378060211277856',
        voucherName: 'sparkyplays'
      },
      {
        id: '261',
        client: 'shinex',
        comment: 'Bought 1x Nitro Boost for 180tk| Legit',
        createdAt: '2023-10-25T16:23:24.654Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166774023716356198'
        },
        receiverId: '982894164620480562',
        receiverName: 'halal_talha',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '967476719353225296',
        voucherName: 'istiak.xo'
      },
      {
        id: '260',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [2.8$] BKASH-BD TO LTC',
        createdAt: '2023-10-25T16:00:53.074Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166768354942529557'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1073515655795576863',
        voucherName: 'anash08'
      },
      {
        id: '259',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [380৳] BKASH-BD TO NAGAD-BD',
        createdAt: '2023-10-25T15:25:05.237Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166759345812414628'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '977505485676748861',
        voucherName: 'afnan_parvez'
      },
      {
        id: '258',
        client: 'shinex',
        comment: 'Bought Minecraft Java + Bedrock Account for 1250tk | Legit',
        createdAt: '2023-10-25T14:09:13.695Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166740255240622090'
        },
        receiverId: '1060583689672728696',
        receiverName: 'k4zit4njim_',
        serverId: '1105905250520531036',
        serverName: 'Treasure Store BD',
        voucherId: '987779753694101575',
        voucherName: 'farhu0'
      },
      {
        id: '257',
        client: 'shinex',
        comment: 'Bought 3m Nitro Activion for 170tk | Legit',
        createdAt: '2023-10-25T11:44:13.441Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166703763986325515'
        },
        receiverId: '982894164620480562',
        receiverName: 'halal_talha',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '624527984577216513',
        voucherName: 'sneakyfrickinscorpion'
      },
      {
        id: '256',
        client: 'shinex',
        comment: 'got 1x nitro bst',
        createdAt: '2023-10-25T11:14:07.650Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166696189547249667'
        },
        receiverId: '1048830290744848446',
        receiverName: 'l_o_r_d_d_e_v_l',
        serverId: '1162649237314613270',
        serverName: 'NITRO HEAVEN',
        voucherId: '844518692955226112',
        voucherName: 'punit_warrior'
      },
      {
        id: '255',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.15$] BKASH-BD TO LTC',
        createdAt: '2023-10-25T07:57:34.333Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166646724811575309'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1073515655795576863',
        voucherName: 'anash08'
      },
      {
        id: '254',
        client: 'shinex',
        comment: 'Bought 3m Nitro Activion for 170tk | Legit',
        createdAt: '2023-10-25T07:35:04.560Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166641064011116554'
        },
        receiverId: '982894164620480562',
        receiverName: 'halal_talha',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '881161683521929287',
        voucherName: 'ryusensleeping'
      },
      {
        id: '253',
        client: 'shinex',
        comment: 'LEGIT EXCHANGE [1.9$] BKASH-BD TO LTC',
        createdAt: '2023-10-25T07:23:06.087Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166638050072350721'
        },
        receiverId: '1087029915393736827',
        receiverName: 'bytebender',
        serverId: '1083066802101297242',
        serverName: 'BAZAR EXCHANGE SERVICE LTD.',
        voucherId: '1135858706639229023',
        voucherName: 'alkaline012'
      },
      {
        id: '252',
        client: 'shinex',
        comment: 'got netflix for 0.5$',
        createdAt: '2023-10-25T07:10:16.338Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166634821238390888'
        },
        receiverId: '1093006625465446460',
        receiverName: 'king_hu_xd',
        serverId: '1127975330263601172',
        serverName: 'SimpiMart',
        voucherId: '1069515672536752149',
        voucherName: 'the_soup_guy49'
      },
      {
        id: '251',
        client: 'shinex',
        comment: '2x Nitro Boost LYF Link $3.5',
        createdAt: '2023-10-24T23:14:30.620Z',
        customData: {
          SHINEX_CONTROLLER_MESSAGE_ID: '1166515092284780645'
        },
        receiverId: '1057299639675670568',
        receiverName: 'jatinback',
        serverId: '1163767120333656094',
        serverName: 'JxTiN St0cks!🧋',
        voucherId: '949857187684036649',
        voucherName: 'nthx._'
      }
    ] as unknown as (typeof newSchema.vouch.$inferInsert & { id: string })[];

    this.db
      .insert(newSchema.vouch)
      .values(
        vouches.map((v) => ({
          ...v,
          createdAt: new Date(v.createdAt),
          id: null
        }))
      )
      .catch((err) => {
        this.logger.log(err);
      });

    this.logger.log('Vouches inserted');
  }
}
