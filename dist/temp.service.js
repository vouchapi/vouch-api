"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TempService", {
    enumerable: true,
    get: function() {
        return TempService;
    }
});
const _common = require("@nestjs/common");
const _schema = /*#__PURE__*/ _interop_require_wildcard(require("./drizzle/schema"));
const _fs = require("fs");
const _constants = require("./constants");
const _drizzlemodule = require("./drizzle/drizzle.module");
const _drizzleorm = require("drizzle-orm");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let TempService = class TempService {
    async onModuleInit() {
        const profiles = JSON.parse((0, _fs.readFileSync)('./src/temp/Profile.json', 'utf-8'));
        this.logger.log('profiles.length: ' + profiles.length);
        const vouches = JSON.parse((0, _fs.readFileSync)('./src/temp/Vouchs.json', 'utf-8'));
        this.logger.log('vouches.length: ' + vouches.length);
        const newProfiles = profiles.map((profile)=>this.profileToNewSchema(profile));
        const newVouches = vouches.map((vouch)=>this.vouchToNewSchema(vouch));
        // clear current database
        await this.db.execute((0, _drizzleorm.sql)`TRUNCATE TABLE "Profile" CASCADE;`);
        await this.db.execute((0, _drizzleorm.sql)`TRUNCATE TABLE "Vouch" CASCADE;`);
        // insert new data
        const insertedProfiles = await this.db.insert(_schema.profile).values(newProfiles).returning();
        const insertedVouches = await this.db.insert(_schema.vouch).values(newVouches).returning();
        this.logger.log('insertedProfiles.length: ' + insertedProfiles.length);
        this.logger.log('insertedVouches.length: ' + insertedVouches.length);
    }
    profileToNewSchema(profile) {
        {
            const newProfileStatusMap = {
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
                mark: profile.markedAt && profile.markedBy ? {
                    at: new Date(profile.markedAt),
                    by: profile.markedBy,
                    for: profile.markedFor
                } : {},
                warning: profile.warningAt && profile.warningBy ? {
                    at: new Date(profile.warningAt),
                    by: profile.warningBy,
                    reason: profile.waringReason
                } : {},
                products: profile.products ?? 'Set your products',
                profileStatus: newProfileStatusMap[profile.profileStatus],
                role: profile.role,
                shop: profile.shop ?? 'Set your shop',
                username: profile.username,
                userId: profile.userId
            };
        }
    }
    vouchToNewSchema(vouch) {
        const vouchStatusMap = {
            APPROVED: 'APPROVED',
            DENIED: 'DENIED',
            PENDING_PROOF: 'PENDING_PROOF_RECEIVER',
            UNCHECKED: 'UNCHECKED'
        };
        return {
            id: vouch.id,
            vouchStatus: vouchStatusMap[vouch.vouchStatus],
            activities: vouch.controlledAt && vouch.controlledBy ? [
                {
                    at: new Date(vouch.controlledAt),
                    staffId: vouch.controlledBy,
                    activity: vouchStatusMap[vouch.vouchStatus],
                    staffName: vouch.controlledBy,
                    vouchId: vouch.id,
                    reason: vouch.deniedReason
                }
            ] : [],
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
    constructor(db){
        _define_property(this, "db", void 0);
        _define_property(this, "logger", void 0);
        this.db = db;
        this.logger = new _common.Logger('TempService');
    }
};
TempService = _ts_decorate([
    _ts_param(0, (0, _common.Inject)(_constants.PG_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _drizzlemodule.DbType === "undefined" ? Object : _drizzlemodule.DbType
    ])
], TempService);
