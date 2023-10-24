"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _operators = require("rxjs/operators");
const _eventsgateway = require("./events.gateway");
describe('EventsGateway', ()=>{
    let gateway;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _eventsgateway.EventsGateway
            ]
        }).compile();
        gateway = module.get(_eventsgateway.EventsGateway);
    });
    it('should be defined', ()=>{
        expect(gateway).toBeDefined();
    });
    describe('findAll', ()=>{
        it('should return 3 numbers', (done)=>{
            gateway.findAll({}).pipe((0, _operators.reduce)((acc, item)=>[
                    ...acc,
                    item
                ], [])).subscribe((results)=>{
                expect(results.length).toBe(3);
                results.forEach((result, index)=>expect(result.data).toBe(index + 1));
                done();
            });
        });
    });
    describe('identity', ()=>{
        it('should return the same number has what was sent', async ()=>{
            await expect(gateway.identity(1)).resolves.toBe(1);
        });
    });
});
