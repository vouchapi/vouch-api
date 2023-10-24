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
    Events: function() {
        return Events;
    },
    ProfileCreatedEvent: function() {
        return ProfileCreatedEvent;
    },
    ProfileUpdatedEvent: function() {
        return ProfileUpdatedEvent;
    },
    VouchCreatedEvent: function() {
        return VouchCreatedEvent;
    },
    VouchUpdatedEvent: function() {
        return VouchUpdatedEvent;
    }
});
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
const Events = {
    ProfileCreated: 'profile.created',
    ProfileUpdated: 'profile.updated',
    VouchCreated: 'vouch.created',
    VouchUpdated: 'vouch.updated'
};
let ProfileCreatedEvent = class ProfileCreatedEvent {
    constructor(profiles){
        _define_property(this, "profiles", void 0);
        this.profiles = profiles;
    }
};
let ProfileUpdatedEvent = class ProfileUpdatedEvent {
    constructor(oldProfiles, newProfiles){
        _define_property(this, "oldProfiles", void 0);
        _define_property(this, "newProfiles", void 0);
        this.oldProfiles = oldProfiles;
        this.newProfiles = newProfiles;
    }
};
let VouchCreatedEvent = class VouchCreatedEvent {
    constructor(vouch){
        _define_property(this, "vouch", void 0);
        this.vouch = vouch;
    }
};
let VouchUpdatedEvent = class VouchUpdatedEvent {
    constructor(oldVouch, newVouch){
        _define_property(this, "oldVouch", void 0);
        _define_property(this, "newVouch", void 0);
        this.oldVouch = oldVouch;
        this.newVouch = newVouch;
    }
};
