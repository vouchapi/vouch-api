"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("dotenv/config");
const _core = require("@nestjs/core");
const _platformfastify = require("@nestjs/platform-fastify");
const _appmodule = require("./app.module");
const _helmet = /*#__PURE__*/ _interop_require_default(require("@fastify/helmet"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// somewhere in your initialization file
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule, new _platformfastify.FastifyAdapter());
    await app.register(_helmet.default);
    await app.listen(process.env.PORT ?? 8080).then(()=>{
        console.log(`Server is running on ${process.env.PORT ?? 8080}`);
    });
}
bootstrap();
