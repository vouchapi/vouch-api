import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

export const profileStatus = pgEnum('ProfileStatus', [
  'SCAMMER',
  'WARN',
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
  'APPROVED',
  'PENDING_PROOF',
  'UNCHECKED'
]);

export const profile = pgTable(
  'Profile',
  {
    id: serial('id').primaryKey().notNull(),
    userId: text('userId').notNull(),
    username: text('username').notNull(),
    role: role('role').default('USER').notNull(),
    profileStatus: profileStatus('profileStatus').default('GOOD').notNull(),
    warningBy: text('warningBy'),
    warningByUser: text('warningByUser'),
    waringReason: text('waringReason'),
    warningAt: timestamp('warningAt', { precision: 3, mode: 'string' }),
    markedBy: text('markedBy'),
    markedByUser: text('markedByUser'),
    markedFor: text('markedFor'),
    markedAt: timestamp('markedAt', { precision: 3, mode: 'string' }),
    color: integer('color'),
    shop: text('shop').default('Set your shop'),
    forum: text('forum').default('Set your forum'),
    products: text('products').default('Set your products'),
    banner: text('banner').default(''),
    positiveVouches: integer('positiveVouches').default(0).notNull(),
    importedVouches: integer('importedVouches').default(0).notNull(),
    latestComments: text('latestComments').array(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    // TODO: failed to parse database type 'Badges"[]'
    badges: text('badges').array()
  },
  (table) => {
    return {
      userId: index('userId').on(table.userId)
    };
  }
);

export const vouchs = pgTable('Vouchs', {
  id: serial('id').primaryKey().notNull(),
  userId: text('userId')
    .notNull()
    .references(() => profile.userId, {
      onDelete: 'restrict',
      onUpdate: 'cascade'
    }),
  vouchStatus: vouchStatus('vouchStatus').default('UNCHECKED').notNull(),
  voucherId: text('voucherId').notNull(),
  voucherName: text('voucherName').notNull(),
  receiverId: text('receiverId').notNull(),
  receiverName: text('receiverName').notNull(),
  comment: text('comment').notNull(),
  controlledBy: text('controlledBy'),
  controlledAt: timestamp('controlledAt', { precision: 3, mode: 'string' }),
  serverId: text('serverId').notNull(),
  serverName: text('serverName').notNull(),
  controllerMessageId: text('controllerMessageId'),
  deniedReason: text('deniedReason'),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'string' }).notNull()
});
