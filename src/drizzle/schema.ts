import {
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

export const profileStatus = pgEnum('ProfileStatus', [
  'DEAL_WITH_CAUTION',
  'BLACKLISTED_AND_DEAL_WITH_CAUTION',
  'SCAMMER',
  'BLOCKED',
  'BLACKLISTED',
  'GOOD'
]);
export const badges = pgEnum('Badges', [
  'SHINEX_ADMIN',
  'SHINEX_STAFF',
  'APPEAL_STAFF',
  'REPORT_STAFF',
  'MEMBER',
  'EARLYSUPPORTER'
]);
export const role = pgEnum('Role', [
  'USER',
  'REPORT_STAFF',
  'MODERATOR',
  'ADMIN',
  'OWNER'
]);
export const vouchStatus = pgEnum('VouchStatus', [
  'DENIED',
  'DENIED_FOR_PROOF',
  'APPROVED',
  'APPROVED_WITH_PROOF',
  'PENDING_PROOF_RECEIVER',
  'PENDING_PROOF_VOUCHER',
  'UNCHECKED',
  'DELETED'
]);

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

export type VouchActivity = {
  vouchId: number;
  staffId: string;
  staffName: string;
  client?: string;
  activity: ElementType<typeof vouchStatus.enumValues>;
  reason?: string;
  at: Date;
};

export const vouch = pgTable('Vouch', {
  id: serial('id').primaryKey().notNull(),
  vouchStatus: vouchStatus('vouchStatus').default('UNCHECKED').notNull(),
  voucherId: text('voucherId').notNull(),
  voucherName: text('voucherName').notNull(),
  receiverId: text('receiverId')
    .notNull()
    .references(() => profile.userId, {
      onDelete: 'restrict',
      onUpdate: 'cascade'
    }),
  receiverName: text('receiverName').notNull(),
  comment: text('comment').notNull(),
  serverId: text('serverId').notNull(),
  serverName: text('serverName').notNull(),
  customData: json('customData').$type<Record<string, any>>(),
  deniedReason: text('deniedReason'),
  activities: json('activities').array().$type<VouchActivity[]>(),
  client: text('client').default('').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull()
});

export const profile = pgTable(
  'Profile',
  {
    id: serial('id').primaryKey().notNull().unique(),
    userId: text('userId').notNull().unique(),
    username: text('username').notNull(),
    customAvatar: text('customAvatar'),
    role: role('role').default('USER').notNull(),
    profileStatus: profileStatus('profileStatus').default('GOOD').notNull(),
    warning: json('warning')
      .default({})
      .$type<{
        reason: string;
        by: string;
        at: Date;
      }>()
      .notNull(),
    mark: json('mark')
      .default({})
      .$type<{
        for: string;
        by: string;
        at: Date;
      }>()
      .notNull(),
    color: integer('color'),
    shop: text('shop').default('Set your shop'),
    forum: text('forum').default('Set your forum'),
    products: text('products').default('Set your products'),
    banner: text('banner').default(''),
    positiveVouches: integer('positiveVouches').default(0).notNull(),
    importedVouches: integer('importedVouches').default(0).notNull(),
    latestComments: text('latestComments').notNull().default(''),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    badges: text('badges'),
    alternative: text('alternative').default('').notNull()
  },
  (table) => {
    return {
      userId: index('userId').on(table.userId)
    };
  }
);

export const notificationType = pgEnum('NotificationType', [
  'VOUCH.RECEIVED',
  'VOUCH.APPROVED',
  'VOUCH.DENIED',
  'VOUCH.PROOF_REQUEST'
]);

export const notification = pgTable('notification', {
  id: serial('id').primaryKey().notNull(),
  userId: text('userId').notNull(),
  type: notificationType('type').notNull(),
  vouchId: integer('vouchId').notNull(),
  client: text('client').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull()
});

export const clientLicense = pgTable('license', {
  id: serial('id').primaryKey().notNull(),
  client: text('client').notNull(),
  key: text('key').notNull(),
  secret: text('secret').notNull()
});
