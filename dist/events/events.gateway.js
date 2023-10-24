"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EventsGateway", {
    enumerable: true,
    get: function() {
        return EventsGateway;
    }
});
const _eventemitter = require("@nestjs/event-emitter");
const _websockets = require("@nestjs/websockets");
const _rxjs = require("rxjs");
const _operators = require("rxjs/operators");
const _socketio = require("socket.io");
const _events = require("./events");
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
let EventsGateway = class EventsGateway {
    findAll(data) {
        console.log(data);
        return (0, _rxjs.from)([
            1,
            2,
            3
        ]).pipe((0, _operators.map)((item)=>({
                event: 'events',
                data: item
            })));
    }
    async identity(data) {
        return data;
    }
    handleProfileCreatedEvent(payload) {
        this.server.emit(_events.Events.ProfileCreated, payload);
    }
    handleProfileUpdatedEvent(payload) {
        this.server.emit(_events.Events.ProfileUpdated, payload);
    }
    handleVouchCreatedEvent(payload) {
        this.server.emit(_events.Events.VouchCreated, payload);
    }
    handleVouchUpdatedEvent(payload) {
        this.server.emit(_events.Events.VouchUpdated, payload);
    }
    constructor(){
        _define_property(this, "server", void 0);
    }
};
_ts_decorate([
    (0, _websockets.WebSocketServer)(),
    _ts_metadata("design:type", typeof _socketio.Server === "undefined" ? Object : _socketio.Server)
], EventsGateway.prototype, "server", void 0);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('events'),
    _ts_param(0, (0, _websockets.MessageBody)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], EventsGateway.prototype, "findAll", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('identity'),
    _ts_param(0, (0, _websockets.MessageBody)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ])
], EventsGateway.prototype, "identity", null);
_ts_decorate([
    (0, _eventemitter.OnEvent)(_events.Events.ProfileCreated),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _events.ProfileCreatedEvent === "undefined" ? Object : _events.ProfileCreatedEvent
    ])
], EventsGateway.prototype, "handleProfileCreatedEvent", null);
_ts_decorate([
    (0, _eventemitter.OnEvent)(_events.Events.ProfileUpdated),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _events.ProfileUpdatedEvent === "undefined" ? Object : _events.ProfileUpdatedEvent
    ])
], EventsGateway.prototype, "handleProfileUpdatedEvent", null);
_ts_decorate([
    (0, _eventemitter.OnEvent)(_events.Events.VouchCreated),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _events.VouchCreatedEvent === "undefined" ? Object : _events.VouchCreatedEvent
    ])
], EventsGateway.prototype, "handleVouchCreatedEvent", null);
_ts_decorate([
    (0, _eventemitter.OnEvent)(_events.Events.VouchUpdated),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _events.VouchUpdatedEvent === "undefined" ? Object : _events.VouchUpdatedEvent
    ])
], EventsGateway.prototype, "handleVouchUpdatedEvent", null);
EventsGateway = _ts_decorate([
    (0, _websockets.WebSocketGateway)({
        cors: {
            origin: '*'
        }
    })
], EventsGateway);
