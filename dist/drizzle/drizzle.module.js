"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DrizzleModule", {
    enumerable: true,
    get: function() {
        return DrizzleModule;
    }
});
const _common = require("@nestjs/common");
const _postgresjs = require("drizzle-orm/postgres-js");
const _migrator = require("drizzle-orm/postgres-js/migrator");
const _postgres = /*#__PURE__*/ _interop_require_default(require("postgres"));
const _config = require("../config");
const _constants = require("../constants");
const _schema = /*#__PURE__*/ _interop_require_wildcard(require("./schema"));
const _drizzleorm = require("drizzle-orm");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
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
let DrizzleModule = class DrizzleModule {
};
DrizzleModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        providers: [
            {
                provide: _constants.PG_CONNECTION,
                inject: [
                    _config.DbConfig.KEY
                ],
                useFactory: async (dbConfig)=>{
                    const sql = (0, _postgres.default)(dbConfig.env === 'dev' ? dbConfig.devBranchUrl : dbConfig.prodBranchUrl);
                    const logger = new _common.Logger('DB');
                    logger.debug('Connecting to Postgresql...');
                    let CustomWriter = class CustomWriter {
                        write(message) {
                            if (dbConfig.env === 'dev') {
                                logger.debug('\n\n------------- [DATABASE DEBUG QUERY] ------------\n\n' + message + '\n\n---------------------------------------------------');
                            }
                        }
                    };
                    const dbLogger = new _drizzleorm.DefaultLogger({
                        writer: new CustomWriter()
                    });
                    const db = (0, _postgresjs.drizzle)(sql, {
                        schema: _schema,
                        logger: dbLogger
                    });
                    await (0, _migrator.migrate)(db, {
                        migrationsFolder: 'drizzle'
                    });
                    logger.debug('Connected to Postgresql!');
                    return db;
                }
            }
        ],
        exports: [
            _constants.PG_CONNECTION
        ]
    })
], DrizzleModule);
