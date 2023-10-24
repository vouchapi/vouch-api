"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Version1Controller", {
    enumerable: true,
    get: function() {
        return Version1Controller;
    }
});
const _common = require("@nestjs/common");
const _profilecache = require("../../cache/profile.cache");
const _schema = require("../../drizzle/schema");
const _vouchcache = require("../../cache/vouch.cache");
const _pgcore = require("drizzle-orm/pg-core");
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
let Version1Controller = class Version1Controller {
    getProfile(id, username) {
        console.log('body' + username);
        return this.profileService.getProfile(id, username);
    }
    registerProfile(id, body) {
        if (!id) {
            return new _common.HttpException('id is required', 400);
        }
        if (!body || !body.username) {
            return new _common.HttpException('username is required', 400);
        }
        return this.profileService.registerProfile([
            {
                userId: id,
                username: body.username
            }
        ], true);
    }
    updateProfile(id, body) {
        if (!id) {
            return new _common.HttpException('id is required', 400);
        }
        if (!body || !body.username) {
            return new _common.HttpException('username is required', 400);
        }
        if (body.id) {
            return new _common.HttpException('id cannot be updated', 400);
        }
        if (body.userId) {
            return new _common.HttpException('userId cannot be updated. user /transfer to transfer ownership', 400);
        }
        return this.profileService.updateProfile(id, body.username, body, true);
    }
    getVouch(vouchId) {
        return this.vouchService.getVouch(parseInt(vouchId));
    }
    postVouch(id, body) {
        if (!id) {
            return new _common.HttpException('id is required', 400);
        }
        if (!body) {
            return new _common.HttpException('vouch body is required', 400);
        }
        return this.vouchService.postVouch(body);
    }
    getVouches(query) {
        return this.vouchService.getVouches(query);
    }
    getVouchById(vouchId) {
        return this.vouchService.getVouch(parseInt(vouchId));
    }
    approveVouch(vouchId, body) {
        if (!body) {
            return new _common.HttpException('Invalid body', 400);
        }
        if (!body.vouchId) body.vouchId = parseInt(vouchId);
        return this.vouchService.approveVouch(body);
    }
    denyVouch(vouchId, body) {
        if (!body) {
            return new _common.HttpException('Invalid body', 400);
        }
        if (!body.vouchId) body.vouchId = parseInt(vouchId);
        return this.vouchService.denyVouch(body);
    }
    askProof(vouchId, who, body) {
        if (!body) {
            return new _common.HttpException('Invalid body', 400);
        }
        if (!body.vouchId) body.vouchId = parseInt(vouchId);
        if (![
            'RECEIVER',
            'VOUCHER'
        ].includes(who)) {
            return new _common.HttpException('Invalid who', 400);
        }
        return this.vouchService.askProofVouch({
            ...body,
            who
        });
    }
    updateVouch(vouchId, body) {
        if (!body) {
            return new _common.HttpException('Invalid body', 400);
        }
        return this.vouchService.updateVouch(parseInt(vouchId), body, true);
    }
    getTop10() {
        return this.profileService.getTop10();
    }
    getHot10() {
        return this.vouchService.getHot10();
    }
    getProducts(query) {
        return this.profileService.searchProduct(query);
    }
    constructor(profileService, vouchService){
        _define_property(this, "profileService", void 0);
        _define_property(this, "vouchService", void 0);
        this.profileService = profileService;
        this.vouchService = vouchService;
    }
};
_ts_decorate([
    (0, _common.Get)('profiles/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)('username')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ])
], Version1Controller.prototype, "getProfile", null);
_ts_decorate([
    (0, _common.Post)('profiles/:id/register'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], Version1Controller.prototype, "registerProfile", null);
_ts_decorate([
    (0, _common.Post)('profiles/:id/update'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], Version1Controller.prototype, "updateProfile", null);
_ts_decorate([
    (0, _common.Get)('profiles/:id/vouches/:vouchId'),
    _ts_param(0, (0, _common.Param)('vouchId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], Version1Controller.prototype, "getVouch", null);
_ts_decorate([
    (0, _common.Post)('profiles/:id/vouches'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _pgcore.PgInsertValue === "undefined" ? Object : _pgcore.PgInsertValue
    ])
], Version1Controller.prototype, "postVouch", null);
_ts_decorate([
    (0, _common.Get)('vouches'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _vouchcache.VouchesFetchOptions === "undefined" ? Object : _vouchcache.VouchesFetchOptions
    ])
], Version1Controller.prototype, "getVouches", null);
_ts_decorate([
    (0, _common.Get)('vouches/:vouchId'),
    _ts_param(0, (0, _common.Param)('vouchId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], Version1Controller.prototype, "getVouchById", null);
_ts_decorate([
    (0, _common.Post)('vouches/:vouchId/approve'),
    _ts_param(0, (0, _common.Param)('vouchId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _schema.VouchActivity === "undefined" ? Object : _schema.VouchActivity
    ])
], Version1Controller.prototype, "approveVouch", null);
_ts_decorate([
    (0, _common.Post)('vouches/:vouchId/deny'),
    _ts_param(0, (0, _common.Param)('vouchId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _schema.VouchActivity === "undefined" ? Object : _schema.VouchActivity
    ])
], Version1Controller.prototype, "denyVouch", null);
_ts_decorate([
    (0, _common.Post)('vouches/:vouchId/askproof/:who'),
    _ts_param(0, (0, _common.Param)('vouchId')),
    _ts_param(1, (0, _common.Param)('who')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Object
    ])
], Version1Controller.prototype, "askProof", null);
_ts_decorate([
    (0, _common.Post)('vouches/:vouchId/update'),
    _ts_param(0, (0, _common.Param)('vouchId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Partial === "undefined" ? Object : Partial
    ])
], Version1Controller.prototype, "updateVouch", null);
_ts_decorate([
    (0, _common.Get)('leaderboard/top'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], Version1Controller.prototype, "getTop10", null);
_ts_decorate([
    (0, _common.Get)('leaderboard/hot'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], Version1Controller.prototype, "getHot10", null);
_ts_decorate([
    (0, _common.Get)('products/:query'),
    _ts_param(0, (0, _common.Param)('query')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], Version1Controller.prototype, "getProducts", null);
Version1Controller = _ts_decorate([
    (0, _common.Controller)('v1'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _profilecache.ProfileService === "undefined" ? Object : _profilecache.ProfileService,
        typeof _vouchcache.VouchService === "undefined" ? Object : _vouchcache.VouchService
    ])
], Version1Controller);
