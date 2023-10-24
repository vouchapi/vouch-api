"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostHogService", {
    enumerable: true,
    get: function() {
        return PostHogService;
    }
});
const _posthognode = require("posthog-node");
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
let PostHogService = class PostHogService extends _posthognode.PostHog {
    constructor(){
        super(process.env.POSTHOG_API_KEY, {
            host: 'https://app.posthog.com'
        });
        _define_property(this, "track", async (event, payload)=>{
            super.capture({
                event,
                distinctId: payload.distinctId,
                properties: payload.properties
            });
        });
    }
};
