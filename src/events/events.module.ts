import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PostHogService } from '../services/log/log.service';

@Module({
  providers: [EventsGateway, PostHogService]
})
export class EventsModule {}
