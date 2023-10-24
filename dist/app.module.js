"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _eventemitter = require("@nestjs/event-emitter");
const _appcontroller = require("./api/app/app.controller");
const _version1controller = require("./api/v1/version1.controller");
const _licensecache = require("./cache/license.cache");
const _profilecache = require("./cache/profile.cache");
const _vouchcache = require("./cache/vouch.cache");
const _config1 = require("./config");
const _drizzlemodule = require("./drizzle/drizzle.module");
const _eventsmodule = require("./events/events.module");
const _clientauth = require("./middleware/client.auth");
const _appauth = require("./middleware/app.auth");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(_appauth.AppAuthMiddleware).forRoutes('register');
        consumer.apply(_clientauth.ClientAuthMiddleware).forRoutes('v1/*');
    }
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _eventemitter.EventEmitterModule.forRoot(),
            _drizzlemodule.DrizzleModule,
            _config.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    _config1.DbConfig
                ]
            }),
            _eventsmodule.EventsModule
        ],
        controllers: [
            _appcontroller.AppController,
            _version1controller.Version1Controller
        ],
        providers: [
            _profilecache.ProfileService,
            _vouchcache.VouchService,
            _licensecache.LicenseService
        ]
    })
], AppModule);
