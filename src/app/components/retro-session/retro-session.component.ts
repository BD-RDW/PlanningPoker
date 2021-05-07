import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../service/session.service';
import { WebsocketService } from '../../service/websocket.service';

import { Message } from '../../model/message';

@Component({
  selector: 'app-retro-session',
  templateUrl: './retro-session.component.html',
  styleUrls: ['./retro-session.component.css']
})
export class RetroSessionComponent implements OnInit {

  public inSession = false;
  public sessionId: string;
  public userId: number;
  public username = '';

  public users: UserInfo[] = [];

  public messages  = 'Default message';
  public status = '';

  constructor(    private sessionService: SessionService,
                  private websocketService: WebsocketService) { }

  ngOnInit(): void {
    this.inSession = false;
    this.sessionId = null;
  }

  public joinSession(): void {
    this.sessionService.joinSession(this.sessionId, this.username).subscribe(session => {
      if (session) {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        this.websocketService.init(this.processMessage);
        this.websocketService.send({ type: 'Session', action: 'join', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}`});
      } else {
        this.inSession = false;
        console.log('Unable to join that session!!');
      }
    });
  }
  public createSession(): void {
    console.log(`Create new session for ${this.username}`);
    this.sessionService.sessionCreate(this.username).subscribe(
      session => {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler);
        this.websocketService.send({ type: 'SESSION', action: 'JOIN', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}`});
      },
      err => console.log(err)
    );
  }

  public addMessage(): void {
    this.websocketService.send({ type: 'SESSION', action: 'MESSAGE',
      sessionId: this.sessionId, userId: this.userId, payload: this.message });
  }
  
  processMessage = (message: Message) => {
    switch (message.type.toUpperCase()) {
      case 'CONNECTION' : this.processConnectionMessage(message); break;
      case 'SESSION' : this.processSessionMessage(message); break;
      case 'ERROR' : this.processErrorMessage(message); break;
      default: console.log(`Unknown message type (${message.type} received.)`);
    }
  }
  processSessionMessage(message: Message): void {
    switch (message.action.toUpperCase()) {
      case 'MESSAGE' : { this.messages = `${message.payload}\n${this.messages}`; break; }
      case 'UPDATE' : {
        this.users = this.getUsersFromMessage(message);
        break;
      }
      default: console.log(`Unknown Session action ${message.action}`);
    }
  }
  processConnectionMessage(message: Message): void {
    switch (message.action.toUpperCase()) {
      case 'INIT' : { this.status = `Websocket connection established`; break; }
      default: console.log(`Unknown Connection action ${message.action}`);
    }
  }
  processErrorMessage(message: Message): void {
    switch (message.action.toUpperCase()) {
      case 'ERROR' : { this.messages = `Error occured: me`; break; }
      default: console.log(`Unknown Error action ${message.action}`);
    }
  }
  private getUsersFromMessage(message: Message): UserInfo[] {
    return message.session.users.map(u => ({name: u.username, vote: u.vote })).sort((u1, u2) => {
      if (u1.name > u2.name) { return 1; }
      if (u1.name < u2.name) { return -1; }
      return 0;
    });
  }
}
interface UserInfo {
  name: string;
}
