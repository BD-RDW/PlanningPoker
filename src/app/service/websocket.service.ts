import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WsMessage } from '../model/message';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$: WebSocketSubject<WsMessage>;
  private wsEndpoint: string;
  private handlers: HandlerSelection[] = [{actions: [' '], handler: this. defaultHandler}];

  constructor(private statusService: StatusService) {
  }

  public send(message: WsMessage): void {
    this.socket$.next(message);
  }

  public connect(): void {
    console.log('Connecting..');
    if (!this.socket$ || this.socket$.closed) {
      console.log('Using wsEndpoint: ' + this.wsEndpoint);
      this.socket$ = webSocket(this.wsEndpoint);
      this.socket$.subscribe(
        (data) => {
          console.log(`Action received; ${data.action}`);
          this.handlers.forEach(h => {
            if ( h.actions.includes(data.action)) {
              console.log(`Action ${data.action} handled: ${h.actions}`);
              h.handler(data);
            }
          });
        },
        (err) => console.error('Recieved error: %O', err),
        () => console.log('Session completed'),
      );
    } else {
      console.log('Connection already existed');
    }
  }

  public init(handler, actions: string[], docHRef: string): void {
    this.handlers.push({ actions, handler} as HandlerSelection);
    this.wsEndpoint = docHRef.replace('http', 'ws');
    this.wsEndpoint = this.wsEndpoint.substring(0, this.wsEndpoint.indexOf('/', 10));
    this.wsEndpoint = this.wsEndpoint + '/stream';
    this.connect();
  }

  private defaultHandler(message: WsMessage): void {
    switch (message.action) {
      case 'ERROR' : this.processErrorMessage(message); break;
      case 'INIT' : { this.statusService.$status.next(`Websocket connection established`); break; }
      default: console.log(`Unknown message action (${message.action} received.)`);
    }
  }
  processErrorMessage(message: WsMessage): void {
    console.log(`Error ${message.payload}`);
  }
}

export interface HandlerSelection {
  actions: string[];
  handler: any;
}
