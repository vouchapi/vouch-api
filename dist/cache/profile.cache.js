/* eslint-disable @typescript-eslint/ban-ts-comment */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProfileService", {
    enumerable: true,
    get: function() {
        return ProfileService;
    }
});
const _common = require("@nestjs/common");
const _eventemitter = require("@nestjs/event-emitter");
const _discord = require("discord.js");
const _drizzleorm = require("drizzle-orm");
const _constants = require("../constants");
const _drizzlemodule = require("../drizzle/drizzle.module");
const _schema = require("../drizzle/schema");
const _events = require("../events/events");
const _getTime = require("../utils/getTime");
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
let ProfileService = class ProfileService {
    async onModuleInit() {
        this.logger.log('ProfileService has been initialized.');
        const starting = new Date();
        const result = await this.db.select().from(_schema.profile);
        this.logger.log('Cached: ' + result.length + ' profiles.');
        this.logger.log('Took:' + (new Date().getTime() - starting.getTime()));
        for (const profile of result){
            this.cache.set(profile.userId, profile);
            if (profile.id > this.lastProfileId) this.lastProfileId = profile.id;
        }
        const top = result.sort((a, b)=>b.positiveVouches + b.importedVouches - a.positiveVouches + a.importedVouches).filter((p)=>p.profileStatus !== 'BLACKLISTED' && p.profileStatus !== 'SCAMMER' && p.profileStatus !== 'BLOCKED').slice(0, 10);
        this.topLeaderboard.clear();
        for (const profile of top){
            this.topLeaderboard.set(profile.userId, profile);
        }
        this.refreshHotLeaderboard();
    }
    async dbRegisterProfile(values) {
        const starting = new Date();
        const notRegistered = values.filter((value)=>!this.cache.has(value.userId));
        if (notRegistered.length === 0) {
            return [];
        }
        if (notRegistered.find((value)=>!value.username)) {
            return [];
        }
        const result = await this.db.insert(_schema.profile).values(notRegistered).returning();
        for (const profile of result){
            this.cache.set(profile.userId, profile);
            if (profile.id > this.lastProfileId) this.lastProfileId = profile.id;
        }
        this.logger.log('Register Took: ' + (new Date().getTime() - starting.getTime()) + 'ms');
        this.logger.log('Registered: ' + result.length + ' profiles.');
        this.eventEmitter.emit(_events.Events.ProfileCreated, new _events.ProfileCreatedEvent(result));
        return result;
    }
    async dbUpdateProfile({ userId, username }, profileData) {
        const starting = new Date();
        await this.getProfile(userId, username, true);
        const oldProfile = this.cache.get(userId);
        const result = await this.db.update(_schema.profile).set(profileData).where((0, _drizzleorm.eq)(_schema.profile.userId, userId)).returning().catch((e)=>{
            console.log(e);
            return [];
        });
        this.cache.set(userId, result[0]);
        this.logger.log('Update Took: ' + (new Date().getTime() - starting.getTime()) + 'ms');
        this.logger.log('Updated: ' + result.length + ' profiles.');
        this.eventEmitter.emit(_events.Events.ProfileUpdated, {
            oldProfile,
            newProfile: result[0]
        });
        return result;
    }
    async refreshLeaderboard() {
        const allProfiles = await this.db.select().from(_schema.profile);
        const top = allProfiles.sort((a, b)=>b.positiveVouches + b.importedVouches - a.positiveVouches + a.importedVouches).filter((p)=>p.profileStatus !== 'BLACKLISTED' && p.profileStatus !== 'SCAMMER' && p.profileStatus !== 'BLOCKED').slice(0, 10);
        this.topLeaderboard.clear();
        for (const profile of top){
            this.topLeaderboard.set(profile.userId, profile);
        }
    }
    async OnVouchUpdateHandler(payload) {
        if (payload.newVouch.vouchStatus === 'APPROVED' || payload.newVouch.vouchStatus === 'APPROVED_WITH_PROOF') {
            this.refreshHotLeaderboard();
        }
    }
    async refreshHotLeaderboard() {
        await new Promise((resolve)=>setTimeout(resolve, 1000 * 9));
        const starting = new Date();
        const allVouches = await this.db.select().from(_schema.vouch);
        const allProfiles = this.cache.toJSON();
        const hot = allProfiles.map((profile)=>{
            const weeklyVouches = allVouches.filter((vouch)=>vouch.receiverId === profile.userId && vouch.createdAt.getTime() > (0, _getTime.getPreviousFridayDate)().getTime()).length;
            return {
                ...profile,
                weeklyVouches
            };
        });
        const top = hot.sort((a, b)=>b.weeklyVouches - a.weeklyVouches).filter((p)=>p.profileStatus !== 'BLACKLISTED' && p.profileStatus !== 'SCAMMER' && p.profileStatus !== 'BLOCKED').slice(0, 10);
        this.hotLeaderboard.clear();
        for (const profile of top){
            this.hotLeaderboard.set(profile.userId, profile);
        }
        this.logger.log('Hot Refresh Took: ' + (new Date().getTime() - starting.getTime()) + 'ms');
    }
    registerProfile(ids, instant = false) {
        if (instant) {
            this.dbRegisterProfile(ids);
            return ids.map((id)=>this.cache.get(id.userId) || this.decoyProfile(id));
        } else {
            return this.dbRegisterProfile(ids);
        }
    }
    decoyProfile(id) {
        return {
            id: ++this.lastProfileId,
            userId: id.userId,
            username: id.username,
            customAvatar: null,
            badges: '',
            banner: null,
            color: null,
            createdAt: new Date(),
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
    getProfile(userId, username, instant = true) {
        return this.cache.get(userId) || this.registerProfile([
            {
                userId,
                username
            }
        ], instant)[0];
    }
    getTop10() {
        return this.topLeaderboard.toJSON();
    }
    getHot10() {
        return this.hotLeaderboard.toJSON();
    }
    updateProfile(userId, username, profileData, instant = false) {
        let current = this.getProfile(userId);
        if (!current) {
            current = this.decoyProfile({
                userId,
                username
            });
            delete current.id;
        }
        const updated = this.mergeAndValidate(current, profileData);
        // compare the current and updated profile
        if (JSON.stringify(current) === JSON.stringify(updated)) {
            this.logger.log('Profile is the same. Skipping update.');
            return updated;
        }
        if (instant) {
            this.dbUpdateProfile({
                userId,
                username
            }, profileData);
            this.cache.set(userId, updated);
            return updated;
        } else {
            return this.dbUpdateProfile({
                userId,
                username
            }, profileData);
        }
    }
    mergeAndValidate(current, updated) {
        // validate if type is correct typeof profile.$inferSelect and not null remove any other properties
        for(const key in updated){
            if (updated[key] && (!_schema.profile[key]?.dataType || typeof updated[key] !== _schema.profile[key].dataType) && ![
                'warning',
                'mark'
            ].includes(key)) {
                delete updated[key];
            }
        }
        // merge the current and updated profile
        const merged = {
            ...current,
            ...updated
        };
        return merged;
    }
    searchProduct(query) {
        const allProfiles = this.cache.toJSON();
        const profileSearchRegex = new RegExp(query, 'igm');
        const results = allProfiles.filter((profile)=>{
            return profile.products.match(profileSearchRegex);
        });
        return results.slice(0, 20);
    }
    constructor(db, eventEmitter){
        _define_property(this, "db", void 0);
        _define_property(this, "eventEmitter", void 0);
        _define_property(this, "cache", void 0);
        _define_property(this, "topLeaderboard", void 0);
        _define_property(this, "hotLeaderboard", void 0);
        _define_property(this, "logger", void 0);
        _define_property(this, "lastProfileId", void 0);
        this.db = db;
        this.eventEmitter = eventEmitter;
        this.cache = new _discord.Collection();
        this.topLeaderboard = new _discord.Collection();
        this.hotLeaderboard = new _discord.Collection();
        this.logger = new _common.Logger(ProfileService.name);
        this.lastProfileId = 0;
    }
};
_ts_decorate([
    (0, _eventemitter.OnEvent)(_events.Events.ProfileUpdated),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], ProfileService.prototype, "refreshLeaderboard", null);
_ts_decorate([
    (0, _eventemitter.OnEvent)(_events.Events.VouchUpdated),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _events.VouchUpdatedEvent === "undefined" ? Object : _events.VouchUpdatedEvent
    ])
], ProfileService.prototype, "OnVouchUpdateHandler", null);
ProfileService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_constants.PG_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _drizzlemodule.DbType === "undefined" ? Object : _drizzlemodule.DbType,
        typeof _eventemitter.EventEmitter2 === "undefined" ? Object : _eventemitter.EventEmitter2
    ])
], ProfileService);
