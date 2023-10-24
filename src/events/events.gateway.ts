import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse
} from '@nestjs/websockets';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import {
  Events,
  ProfileCreatedEvent,
  ProfileUpdatedEvent,
  VouchCreatedEvent,
  VouchUpdatedEvent
} from './events';
import { PostHogService } from '../services/log/log.service';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class EventsGateway {
  constructor(private readonly postHog: PostHogService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log(data);
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item }))
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @OnEvent(Events.ProfileCreated)
  handleProfileCreatedEvent(payload: ProfileCreatedEvent) {
    this.server.emit(Events.ProfileCreated, payload);

    for (const profile of payload.profiles) {
      this.postHog.track('PROFILE_REGISTERED', {
        distinctId: profile.userId,
        properties: {
          userId: profile.userId,
          username: profile.username
        }
      });
    }
  }

  @OnEvent(Events.ProfileUpdated)
  handleProfileUpdatedEvent(payload: ProfileUpdatedEvent) {
    this.server.emit(Events.ProfileUpdated, payload);
  }

  @OnEvent(Events.VouchCreated)
  handleVouchCreatedEvent(payload: VouchCreatedEvent) {
    this.server.emit(Events.VouchCreated, payload);

    this.postHog.track('VOUCH_POSTED', {
      distinctId: payload.vouch.id.toString(),
      properties: {
        client: payload.vouch.client,
        userId: payload.vouch.receiverId,
        vouchId: payload.vouch.id
      }
    });
  }

  @OnEvent(Events.VouchUpdated)
  handleVouchUpdatedEvent(payload: VouchUpdatedEvent) {
    this.server.emit(Events.VouchUpdated, payload);

    const postPayload = {
      distinctId: payload.newVouch.id.toString(),
      properties: {
        client: payload.newVouch.client,
        userId: payload.newVouch.receiverId,
        vouchId: payload.newVouch.id
      }
    };

    if (
      payload.newVouch.vouchStatus === 'APPROVED' ||
      payload.newVouch.vouchStatus === 'APPROVED_WITH_PROOF'
    ) {
      this.postHog.track('VOUCH_APPROVE', postPayload);
    } else if (
      payload.newVouch.vouchStatus === 'DENIED' ||
      payload.newVouch.vouchStatus === 'DENIED_FOR_PROOF'
    ) {
      this.postHog.track('VOUCH_DENIED', postPayload);
    }
  }
}
