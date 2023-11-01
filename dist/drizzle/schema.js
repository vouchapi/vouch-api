"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    badges: function() {
        return badges;
    },
    clientLicense: function() {
        return clientLicense;
    },
    notification: function() {
        return notification;
    },
    notificationSettings: function() {
        return notificationSettings;
    },
    notificationType: function() {
        return notificationType;
    },
    profile: function() {
        return profile;
    },
    profileRelations: function() {
        return profileRelations;
    },
    profileStatus: function() {
        return profileStatus;
    },
    role: function() {
        return role;
    },
    vouch: function() {
        return vouch;
    },
    vouchStatus: function() {
        return vouchStatus;
    }
});
const _drizzleorm = require("drizzle-orm");
const _pgcore = require("drizzle-orm/pg-core");
const profileStatus = (0, _pgcore.pgEnum)('ProfileStatus', [
    'DEAL_WITH_CAUTION',
    'BLACKLISTED_AND_DEAL_WITH_CAUTION',
    'SCAMMER',
    'BLOCKED',
    'BLACKLISTED',
    'GOOD'
]);
const badges = (0, _pgcore.pgEnum)('Badges', [
    'SHINEX_ADMIN',
    'SHINEX_STAFF',
    'APPEAL_STAFF',
    'REPORT_STAFF',
    'MEMBER',
    'EARLYSUPPORTER'
]);
const role = (0, _pgcore.pgEnum)('Role', [
    'USER',
    'REPORT_STAFF',
    'MODERATOR',
    'ADMIN',
    'OWNER'
]);
const vouchStatus = (0, _pgcore.pgEnum)('VouchStatus', [
    'DENIED',
    'DENIED_FOR_PROOF',
    'APPROVED',
    'APPROVED_WITH_PROOF',
    'PENDING_PROOF_RECEIVER',
    'PENDING_PROOF_VOUCHER',
    'UNCHECKED',
    'DELETED'
]);
const notificationType = (0, _pgcore.pgEnum)('NotificationType', [
    'VOUCH.RECEIVED',
    'VOUCH.APPROVED',
    'VOUCH.DENIED',
    'VOUCH.PROOF_REQUEST'
]);
const clientLicense = (0, _pgcore.pgTable)('license', {
    id: (0, _pgcore.serial)('id').primaryKey().notNull(),
    client: (0, _pgcore.text)('client').notNull(),
    key: (0, _pgcore.text)('key').notNull(),
    secret: (0, _pgcore.text)('secret').notNull()
});
const profile = (0, _pgcore.pgTable)('Profile', {
    id: (0, _pgcore.serial)('id').primaryKey().notNull(),
    userId: (0, _pgcore.text)('userId').notNull().unique(),
    username: (0, _pgcore.text)('username').notNull(),
    customAvatar: (0, _pgcore.text)('customAvatar'),
    role: role('role').default('USER').notNull(),
    profileStatus: profileStatus('profileStatus').default('GOOD').notNull(),
    warning: (0, _pgcore.json)('warning').default({}).$type().notNull(),
    mark: (0, _pgcore.json)('mark').default({}).$type().notNull(),
    color: (0, _pgcore.integer)('color'),
    shop: (0, _pgcore.text)('shop').default('Set your shop'),
    forum: (0, _pgcore.text)('forum').default('Set your forum'),
    products: (0, _pgcore.text)('products').default('Set your products'),
    banner: (0, _pgcore.text)('banner').default(''),
    positiveVouches: (0, _pgcore.integer)('positiveVouches').default(0).notNull(),
    importedVouches: (0, _pgcore.integer)('importedVouches').default(0).notNull(),
    latestComments: (0, _pgcore.text)('latestComments').notNull().default(''),
    createdAt: (0, _pgcore.timestamp)('createdAt', {
        mode: 'date'
    }).defaultNow().notNull(),
    badges: (0, _pgcore.text)('badges'),
    alternative: (0, _pgcore.text)('alternative').default('').notNull()
}, (table)=>{
    return {
        userId: (0, _pgcore.index)('userId').on(table.userId)
    };
});
const profileRelations = (0, _drizzleorm.relations)(profile, ({ one })=>({
        notificationSettings: one(notificationSettings, {
            fields: [
                profile.userId
            ],
            references: [
                notificationSettings.userId
            ]
        })
    }));
const vouch = (0, _pgcore.pgTable)('Vouch', {
    id: (0, _pgcore.serial)('id').primaryKey().notNull(),
    vouchStatus: vouchStatus('vouchStatus').default('UNCHECKED').notNull(),
    voucherId: (0, _pgcore.text)('voucherId').notNull(),
    voucherName: (0, _pgcore.text)('voucherName').notNull(),
    receiverId: (0, _pgcore.text)('receiverId').notNull(),
    receiverName: (0, _pgcore.text)('receiverName').notNull(),
    comment: (0, _pgcore.text)('comment').notNull(),
    serverId: (0, _pgcore.text)('serverId').notNull(),
    serverName: (0, _pgcore.text)('serverName').notNull(),
    customData: (0, _pgcore.json)('customData').$type(),
    deniedReason: (0, _pgcore.text)('deniedReason'),
    activities: (0, _pgcore.json)('activities').array().$type(),
    client: (0, _pgcore.text)('client').default('').notNull(),
    createdAt: (0, _pgcore.timestamp)('createdAt', {
        mode: 'date'
    }).defaultNow().notNull()
});
const notificationSettings = (0, _pgcore.pgTable)('notificationSettings', {
    id: (0, _pgcore.serial)('id').primaryKey().notNull(),
    userId: (0, _pgcore.text)('userId').notNull().unique().references(()=>profile.userId),
    vouchReceived: (0, _pgcore.boolean)('vouchReceived').default(true).notNull(),
    vouchApproved: (0, _pgcore.boolean)('vouchApproved').default(true).notNull(),
    vouchDenied: (0, _pgcore.boolean)('vouchDenied').default(true).notNull(),
    vouchProofRequest: (0, _pgcore.boolean)('vouchProofRequest').default(true).notNull(),
    createdAt: (0, _pgcore.timestamp)('createdAt', {
        mode: 'date'
    }).defaultNow().notNull(),
    updatedAt: (0, _pgcore.timestamp)('updatedAt', {
        mode: 'date'
    }).defaultNow().notNull()
});
const notification = (0, _pgcore.pgTable)('notification', {
    id: (0, _pgcore.serial)('id').primaryKey().notNull(),
    userId: (0, _pgcore.text)('userId').notNull(),
    type: notificationType('type').notNull(),
    vouchId: (0, _pgcore.integer)('vouchId').notNull(),
    client: (0, _pgcore.text)('client').notNull(),
    read: (0, _pgcore.boolean)('read').default(false).notNull(),
    createdAt: (0, _pgcore.timestamp)('createdAt', {
        mode: 'date'
    }).defaultNow().notNull()
});
