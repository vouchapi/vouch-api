"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClientAuthMiddleware", {
    enumerable: true,
    get: function() {
        return ClientAuthMiddleware;
    }
});
const _common = require("@nestjs/common");
const _licensecache = require("../cache/license.cache");
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
let ClientAuthMiddleware = class ClientAuthMiddleware {
    async use(req, res, next) {
        const key = req.headers['x-client-key'];
        const secret = req.headers['x-client-secret'];
        if (!key || !secret) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end('Unauthorized');
            return;
        }
        const valid = await this.licenseService.validateLicense(key, secret);
        if (!valid) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end('Unauthorized');
            return;
        }
        next();
    }
    constructor(licenseService){
        _define_property(this, "licenseService", void 0);
        this.licenseService = licenseService;
    }
};
ClientAuthMiddleware = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _licensecache.LicenseService === "undefined" ? Object : _licensecache.LicenseService
    ])
], ClientAuthMiddleware);
