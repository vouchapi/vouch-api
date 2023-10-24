import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './api/app/app.controller';
import { Version1Controller } from './api/v1/version1.controller';
import { LicenseService } from './cache/license.cache';
import { ProfileService } from './cache/profile.cache';
import { VouchService } from './cache/vouch.cache';
import { DbConfig } from './config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { EventsModule } from './events/events.module';
import { ClientAuthMiddleware } from './middleware/client.auth';
import { AppAuthMiddleware } from './middleware/app.auth';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DbConfig]
    }),
    EventsModule
  ],
  controllers: [AppController, Version1Controller],
  providers: [ProfileService, VouchService, LicenseService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppAuthMiddleware).forRoutes('register');
    consumer.apply(ClientAuthMiddleware).forRoutes('v1/*');
  }
}
