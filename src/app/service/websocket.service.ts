import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { WsMessage } from '../model/message';

export const WS_ENDPOINT = environment.wsEndpoint;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$: WebSocketSubject<WsMessage>;
  private messageHandler: any;

  constructor() {
  }

  public send(message: WsMessage): void {
    this.socket$.next(message);
  }

  public connect(url): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(WS_ENDPOINT);
      this.socket$.subscribe(
        (data) => this.messageHandler(data),
        (err) => console.error('Recieved error: %O', err),
        () => console.log('Session completed'),
      );
    }
  }

  public init(handler): void {
    this.messageHandler = handler;
    this.connect(WS_ENDPOINT);
  }
}
