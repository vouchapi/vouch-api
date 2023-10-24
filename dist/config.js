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
    API_ENDPOINT: function() {
        return API_ENDPOINT;
    },
    BOT_TOKEN: function() {
        return BOT_TOKEN;
    },
    DbConfig: function() {
        return DbConfig;
    },
    WEB_URL: function() {
        return WEB_URL;
    }
});
const _config = require("@nestjs/config");
const API_ENDPOINT = 'https://discord.com/api/v10';
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';
const BOT_TOKEN = process.env['BOT_TOKEN'];
const DbConfig = (0, _config.registerAs)('db', ()=>({
        env: process.env.NODE_ENV,
        prodBranchUrl: process.env.PROD_BRANCH_URL,
        devBranchUrl: process.env.DEV_BRANCH_URL
    }));
