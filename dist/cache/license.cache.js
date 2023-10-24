"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LicenseService", {
    enumerable: true,
    get: function() {
        return LicenseService;
    }
});
const _common = require("@nestjs/common");
const _discord = require("discord.js");
const _constants = require("../constants");
const _drizzlemodule = require("../drizzle/drizzle.module");
const _schema = require("../drizzle/schema");
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
let LicenseService = class LicenseService {
    async onModuleInit() {
        const allLicenses = await this.db.select().from(_schema.clientLicense);
        for (const license of allLicenses){
            this.cache.set(license.key, license);
        }
        this.logger.log('Cached: ' + allLicenses.length + ' licenses.');
    }
    async registerLicense(key, client) {
        const alreadyRegistered = this.cache.get(key);
        if (alreadyRegistered) {
            return new _common.HttpException('License already registered.', 400);
        }
        // size 24
        const secret = Math.random().toString(36).substring(2, 26);
        const result = await this.db.insert(_schema.clientLicense).values([
            {
                key,
                client,
                secret
            }
        ]).returning();
        if (!result[0]) {
            return new _common.HttpException('Failed to register license.', 500);
        }
        this.cache.set(key, result[0]);
        return {
            key,
            secret
        };
    }
    async validateLicense(key, secret) {
        const license = this.cache.get(key);
        if (!license) {
            return {
                client: null,
                valid: false
            };
        }
        const valid = secret === license.secret;
        return {
            client: license.client,
            valid
        };
    }
    constructor(db){
        _define_property(this, "db", void 0);
        _define_property(this, "cache", void 0);
        _define_property(this, "logger", void 0);
        this.db = db;
        this.cache = new _discord.Collection();
        this.logger = new _common.Logger(LicenseService.name);
    }
};
LicenseService = _ts_decorate([
    _ts_param(0, (0, _common.Inject)(_constants.PG_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _drizzlemodule.DbType === "undefined" ? Object : _drizzlemodule.DbType
    ])
], LicenseService);
