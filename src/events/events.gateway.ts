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

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class EventsGateway {
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
  }

  @OnEvent(Events.ProfileUpdated)
  handleProfileUpdatedEvent(payload: ProfileUpdatedEvent) {
    this.server.emit(Events.ProfileUpdated, payload);
  }

  @OnEvent(Events.VouchCreated)
  handleVouchCreatedEvent(payload: VouchCreatedEvent) {
    this.server.emit(Events.VouchCreated, payload);
  }

  @OnEvent(Events.VouchUpdated)
  handleVouchUpdatedEvent(payload: VouchUpdatedEvent) {
    this.server.emit(Events.VouchUpdated, payload);
  }
}
