// contract.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "version1", {
    enumerable: true,
    get: function() {
        return version1;
    }
});
const _core = require("@ts-rest/core");
const _zod = require("zod");
const c = (0, _core.initContract)();
const PostSchema = _zod.z.object({
    id: _zod.z.string(),
    title: _zod.z.string(),
    body: _zod.z.string()
});
const version1 = c.router({
    registerProfile: {
        method: 'POST',
        path: 'profiles/:id/register',
        body: _zod.z.object({
            id: _zod.z.string(),
            username: _zod.z.string()
        }),
        responses: {
            200: PostSchema
        }
    }
});
