import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WsMessage } from '../model/message';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$: WebSocketSubject<WsMessage>;
  private messageHandler: any;
  private wsEndpoint: string;

  constructor() {
  }

  public send(message: WsMessage): void {
    this.socket$.next(message);
  }

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      console.log('Using wsEndpoint: ' + this.wsEndpoint);
      this.socket$ = webSocket(this.wsEndpoint);
      this.socket$.subscribe(
        (data) => this.messageHandler(data),
        (err) => console.error('Recieved error: %O', err),
        () => console.log('Session completed'),
      );
    }
  }

  public init(handler, docHRef: string): void {
    this.messageHandler = handler;
    this.wsEndpoint = docHRef.replace('http', 'ws');
    this.wsEndpoint = this.wsEndpoint.substring(0, this.wsEndpoint.indexOf('/', 10));
    this.wsEndpoint = this.wsEndpoint + '/stream';
    this.connect();
  }
}
