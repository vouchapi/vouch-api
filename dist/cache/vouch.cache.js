/* eslint-disable @typescript-eslint/ban-ts-comment */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VouchService", {
    enumerable: true,
    get: function() {
        return VouchService;
    }
});
const _common = require("@nestjs/common");
const _discord = require("discord.js");
const _drizzleorm = require("drizzle-orm");
const _constants = require("../constants");
const _drizzlemodule = require("../drizzle/drizzle.module");
const _schema = require("../drizzle/schema");
const _profilecache = require("./profile.cache");
const _eventemitter = require("@nestjs/event-emitter");
const _events = require("../events/events");
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
let VouchService = class VouchService {
    async onModuleInit() {
        this.logger.log('VouchService has been initialized.');
        const starting = new Date();
        const result = await this.db.select().from(_schema.vouch);
        this.logger.log('Cached: ' + result.length + ' vouches.');
        this.logger.log('Took:' + (new Date().getTime() - starting.getTime()));
        for (const vouch of result){
            this.cache.set(vouch.id, vouch);
            if (vouch.id > this.lastVouchId) this.lastVouchId = vouch.id;
        }
        this.logger.log('Last vouch id: ' + this.lastVouchId);
    }
    async dbUpdateVouch(id, vouchData) {
        const starting = new Date();
        const oldVouch = this.cache.get(id);
        const result = await this.db.update(_schema.vouch).set(vouchData).where((0, _drizzleorm.eq)(_schema.vouch.id, id)).returning();
        this.cache.set(result[0].id, result[0]);
        this.logger.log('Update Took: ' + (new Date().getTime() - starting.getTime()) + 'ms');
        this.logger.log('Updated: ' + result.length + ' vouches.');
        this.eventEmitter.emit(_events.Events.VouchUpdated, new _events.VouchUpdatedEvent(oldVouch, result[0]));
        return result[0];
    }
    updateVouch(id, vouchData, instant = false) {
        const current = this.cache.get(id);
        if (!current) return new _common.HttpException('Vouch not found', 404);
        const merged = this.mergeAndValidate(current, vouchData);
        if (merged instanceof _common.HttpException) {
            return merged;
        }
        if (vouchData.vouchStatus === current.vouchStatus) {
            return new _common.HttpException('Vouch is already ' + vouchData.vouchStatus, 400);
        }
        if (vouchData.vouchStatus === 'UNCHECKED') {
            return new _common.HttpException('Vouch status cannot be UNCHECKED', 400);
        }
        if (current.vouchStatus === 'APPROVED' && merged.vouchStatus === 'DENIED') {
            return new _common.HttpException('Vouch already approved cannot be denied', 400);
        }
        if (current.vouchStatus === 'APPROVED' && (merged.vouchStatus === 'PENDING_PROOF_RECEIVER' || merged.vouchStatus === 'PENDING_PROOF_VOUCHER')) {
            return new _common.HttpException('Vouch already approved cannot be asked proof', 400);
        }
        if (instant) {
            this.dbUpdateVouch(id, vouchData);
            return merged;
        } else {
            return this.dbUpdateVouch(id, vouchData);
        }
    }
    async dbPostVouch(vouchData) {
        const starting = new Date();
        const vouchDataValidated = this.validateVouch(vouchData);
        if (vouchDataValidated instanceof _common.HttpException) {
            return vouchDataValidated;
        }
        const result = await this.db.insert(_schema.vouch).values(vouchDataValidated).returning();
        // @ts-ignore
        this.cache.set(result[0].id, result[0]);
        this.logger.log('Insert Took: ' + (new Date().getTime() - starting.getTime()) + 'ms');
        this.logger.log('Inserted: ' + result.length + ' vouches.');
        if (this.lastVouchId < result[0].id) {
            this.lastVouchId = result[0].id;
        }
        this.eventEmitter.emit(_events.Events.VouchCreated, new _events.VouchCreatedEvent(result[0]));
        return result[0];
    }
    getVouch(id) {
        return this.cache.get(id);
    }
    async postVouch(vouchData, instant = true) {
        const vouchDataValidated = this.validateVouch(vouchData);
        if (vouchDataValidated instanceof _common.HttpException) {
            return vouchDataValidated;
        }
        await this.profileService.getProfile(vouchDataValidated.receiverId, vouchDataValidated.receiverName, false);
        if (instant) {
            this.dbPostVouch(vouchDataValidated);
            return this.decoyVouch(vouchDataValidated);
        } else {
            return this.dbPostVouch(vouchDataValidated);
        }
    }
    validateVouch(vouchData) {
        const requiredKeys = Object.entries(_schema.vouch).filter(([, value])=>{
            return value && value.notNull && !value.hasDefault;
        });
        const missingKeys = requiredKeys.filter(([key])=>{
            return !vouchData[key];
        });
        if (missingKeys.length > 0) {
            return new _common.HttpException('Missing required keys: ' + missingKeys.map(([key])=>key).join(', '), 400);
        }
        const invalidKeys = Object.entries(_schema.vouch).filter(([, value])=>{
            return value && value.notNull && !value.hasDefault;
        });
        const invalidKeysData = invalidKeys.filter(([key, value])=>{
            return typeof vouchData[key] !== value.dataType;
        });
        if (invalidKeysData.length > 0) {
            return new _common.HttpException('Invalid keys: ' + invalidKeysData.map(([key, value])=>key + ' should be ' + value.type).join(', '), 400);
        }
        vouchData.comment = this.refineString(vouchData.comment);
        return vouchData;
    }
    getProfileVouches(id) {
        return this.cache.filter((vouch)=>vouch.receiverId === id).toJSON();
    }
    getVouches(query) {
        let vouches = this.cache.toJSON();
        if (query) {
            if (typeof query.vouchId === 'string') {
                const vouchIds = query.vouchId.split(',');
                vouches = vouches.filter((vouch)=>vouchIds.includes(vouch.id + ''));
            }
            if (typeof query.status === 'string') {
                vouches = vouches.filter((vouch)=>vouch.vouchStatus === query.status);
            }
            if (typeof query.receiverId === 'string') {
                vouches = vouches.filter((vouch)=>vouch.receiverId === query.receiverId);
            }
            if (typeof query.senderId === 'string') {
                vouches = vouches.filter((vouch)=>vouch.voucherId === query.senderId);
            }
            if (query.sortBy && [
                'createdAt',
                'id'
            ].includes(query.sortBy)) {
                if (query.sortBy === 'createdAt') {
                    vouches = vouches.sort((a, b)=>{
                        return a.createdAt.getTime() - b.createdAt.getTime();
                    });
                } else {
                    vouches = vouches.sort((a, b)=>{
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
        const hotVouches = vouches.filter((vouch)=>vouch.createdAt > weekAgo);
        const merged = hotVouches.reduce((acc, vouch)=>{
            if (acc[vouch.receiverId]) {
                acc[vouch.receiverId].push(vouch);
            } else {
                acc[vouch.receiverId] = [
                    vouch
                ];
            }
            return acc;
        }, {});
        const hotVouchesCount = Object.entries(merged).map(([key, value])=>{
            return {
                id: key,
                username: value[0].receiverName,
                count: value.length
            };
        });
        const sorted = hotVouchesCount.sort((a, b)=>b.count - a.count);
        const top10 = sorted.slice(0, 10);
        return top10;
    }
    async approveVouch({ vouchId, staffId, staffName, client }, withProof = false) {
        const validate = this.validateVouchActivity({
            vouchId,
            staffId,
            staffName,
            activity: withProof ? 'APPROVED_WITH_PROOF' : 'APPROVED',
            client
        });
        if (validate instanceof _common.HttpException) {
            return validate;
        }
        const vouch = await this.updateVouch(vouchId, {
            vouchStatus: withProof ? 'APPROVED_WITH_PROOF' : 'APPROVED',
            activities: [
                ...this.cache.get(vouchId)?.activities || [],
                {
                    vouchId,
                    staffId,
                    staffName,
                    client,
                    activity: withProof ? 'APPROVED_WITH_PROOF' : 'APPROVED',
                    at: new Date()
                }
            ]
        }, true);
        if (vouch instanceof _common.HttpException) {
            return vouch;
        }
        const currentProfile = this.profileService.getProfile(vouch.receiverId, vouch.receiverName, true);
        const latestComments = currentProfile.latestComments === '' ? [] : currentProfile.latestComments.split(',');
        latestComments.reverse();
        latestComments.push(vouch.comment);
        latestComments.slice(0, 5);
        latestComments.reverse();
        const updateProfileData = {
            positiveVouches: currentProfile.positiveVouches + 1,
            latestComments: latestComments.join(',')
        };
        await this.profileService.updateProfile(vouch.receiverId, vouch.receiverName, updateProfileData, true);
        return vouch;
    }
    denyVouch({ vouchId, staffId, staffName, client, reason }) {
        const validate = this.validateVouchActivity({
            vouchId,
            staffId,
            staffName,
            activity: 'DENIED',
            client
        });
        if (validate instanceof _common.HttpException) {
            return validate;
        }
        return this.updateVouch(vouchId, {
            vouchStatus: 'DENIED',
            deniedReason: reason,
            activities: [
                ...this.cache.get(vouchId)?.activities || [],
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
    askProofVouch({ vouchId, staffId, staffName, client, who }) {
        const status = who === 'RECEIVER' ? 'PENDING_PROOF_RECEIVER' : 'PENDING_PROOF_VOUCHER';
        const validate = this.validateVouchActivity({
            vouchId,
            staffId,
            staffName,
            activity: status,
            client,
            who
        }, true);
        if (validate instanceof _common.HttpException) {
            return validate;
        }
        return this.updateVouch(vouchId, {
            vouchStatus: status,
            activities: [
                ...this.cache.get(vouchId)?.activities || [],
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
    decoyVouch(vouchData) {
        return {
            comment: vouchData.comment,
            receiverId: vouchData.receiverId,
            receiverName: vouchData.receiverName,
            vouchStatus: 'UNCHECKED',
            voucherId: vouchData.voucherId,
            voucherName: vouchData.voucherName,
            serverId: vouchData.serverId,
            serverName: vouchData.serverName,
            id: ++this.lastVouchId,
            createdAt: new Date(),
            activities: [],
            customData: {},
            client: vouchData.client || '',
            deniedReason: null
        };
    }
    mergeAndValidate(current, updated) {
        const merged = {
            ...current,
            ...updated
        };
        const requiredKeys = Object.entries(_schema.vouch).filter(([, value])=>{
            return value && value.notNull && !value.hasDefault;
        });
        const missingKeys = requiredKeys.filter(([key])=>{
            return !merged[key];
        });
        if (missingKeys.length > 0) {
            return new _common.HttpException('Missing required keys: ' + missingKeys.map(([key])=>key).join(', '), 400);
        }
        const invalidKeys = Object.entries(_schema.vouch).filter(([, value])=>{
            return value && value.notNull && !value.hasDefault;
        });
        const invalidKeysData = invalidKeys.filter(([key, value])=>{
            return typeof merged[key] !== value.dataType;
        });
        if (invalidKeysData.length > 0) {
            return new _common.HttpException('Invalid keys: ' + invalidKeysData.map(([key, value])=>key + ' should be ' + value.type).join(', '), 400);
        }
        return merged;
    }
    validateVouchActivity(data, who = false) {
        const requiredKeys = [
            'vouchId',
            'staffId',
            'staffName',
            'activity'
        ];
        if (who) {
            requiredKeys.push('who');
        }
        const missingKeys = requiredKeys.filter((key)=>{
            return !data[key];
        });
        if (missingKeys.length > 0) {
            return new _common.HttpException('Missing required keys: ' + missingKeys.join(', '), 400);
        }
        const types = {
            vouchId: 'number',
            staffId: 'string',
            staffName: 'string',
            activity: 'string',
            who: 'string',
            client: 'string'
        };
        const invalidKeysData = Object.entries(types).filter(([key, type])=>{
            return typeof data[key] !== type && data[key];
        });
        if (invalidKeysData.length > 0) {
            return new _common.HttpException('Invalid keys: ' + invalidKeysData.map(([key, value])=>key + ' should be ' + value).join(', '), 400);
        }
        return data;
    }
    refineString(input) {
        // Replace commas and colons with an empty string
        const refinedString = input.replace(/[,\u200B\u200C\u200D\u200E\u200F\u202A-\u202E\n]/g, '');
        return refinedString.trim();
    }
    importTxtToVouches(file, receiverId, receiverName, clinet) {
        switch(clinet){
            case 'SHIBA':
                {
                    const vouches = file.split('---------');
                    const vouchData = [];
                    for (const vouch of vouches){
                        const lines = vouch.split('\n');
                        const comment = lines[2].replace('Comment: ', '').trim();
                        const voucher = lines[2].replace('Reviewer: ', '').trim().split('#')[0];
                        const time = new Date(lines[3].replace('Time: ', '').trim());
                        vouchData.push({
                            comment,
                            time,
                            voucher
                        });
                    }
                    const vouchDbData = vouchData.map((vouch)=>{
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
                    });
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
    constructor(db, profileService, eventEmitter){
        _define_property(this, "db", void 0);
        _define_property(this, "profileService", void 0);
        _define_property(this, "eventEmitter", void 0);
        _define_property(this, "cache", void 0);
        _define_property(this, "logger", void 0);
        _define_property(this, "lastVouchId", void 0);
        this.db = db;
        this.profileService = profileService;
        this.eventEmitter = eventEmitter;
        this.cache = new _discord.Collection();
        this.logger = new _common.Logger(VouchService.name);
        this.lastVouchId = 0;
    }
};
VouchService = _ts_decorate([
    _ts_param(0, (0, _common.Inject)(_constants.PG_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _drizzlemodule.DbType === "undefined" ? Object : _drizzlemodule.DbType,
        typeof _profilecache.ProfileService === "undefined" ? Object : _profilecache.ProfileService,
        typeof _eventemitter.EventEmitter2 === "undefined" ? Object : _eventemitter.EventEmitter2
    ])
], VouchService);
