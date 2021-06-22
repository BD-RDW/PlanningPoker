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
  private handlers: HandlerSelection[] = [];
  private thereHasBeenContact = false;

  constructor(private statusService: StatusService) {
    this.handlers.push({ actions: ['pong', 'ERROR', 'INIT'], handler: this.defaultHandler.bind(this) });
  }

  public send(message: WsMessage): void {
    if (!this.socket$ || this.socket$.closed) {
      console.log('The connection has closed!!');
    }
    this.socket$.next(message);
  }

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      let handled = false;
      console.log('Using wsEndpoint: ' + this.wsEndpoint);
      this.socket$ = webSocket(this.wsEndpoint);
      this.socket$.subscribe(
        (data) => {
          console.log(`Action received; ${data.action}`);
          this.thereHasBeenContact = true;
          this.handlers.forEach(h => {
            if (h.actions.includes(data.action)) {
              handled = true;
              console.log(`Action ${data.action} handled: ${h.actions}`);
              h.handler(data);
            }
          });
          if (! handled) {
            console.log(`Action ${data.action} could not be handled!!`);
          }
        },
        (err) => console.error('Recieved error: %O', err),
        () => console.log('Session completed'),
      );
      setInterval(this.checkToSentPing.bind(this), 60000);
    } else {
      console.log('Connection already existed');
    }
  }

  public init(handler, actions: string[], docHRef: string): void {
    this.handlers.push({ actions, handler } as HandlerSelection);
    this.wsEndpoint = docHRef.replace('http', 'ws');
    this.wsEndpoint = this.wsEndpoint.substring(0, this.wsEndpoint.indexOf('/', 10));
    this.wsEndpoint = this.wsEndpoint + '/stream';
    this.connect();
  }

  private defaultHandler(message: WsMessage): void {
    switch (message.action) {
      case 'pong' : console.log('Pong received'); break;
      case 'ERROR': this.processErrorMessage(message); break;
      case 'INIT': { this.statusService.$status.next(`Websocket connection established`); break; }
      default: console.log(`Unknown message action (${message.action} received.)`);
    }
  }
  private processErrorMessage(message: WsMessage): void {
    console.log(`Error ${message.payload}`);
  }
  private checkToSentPing(): void {
    if (this.thereHasBeenContact) {
      this.thereHasBeenContact = false;
    } else {
      this.send({ action: 'ping', sessionId: '0', userId: -1 } as WsMessage);
    }
  }
}

export interface HandlerSelection {
  actions: string[];
  handler: any;
}
