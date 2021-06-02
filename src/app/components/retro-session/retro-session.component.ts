import { Component, OnInit, ViewChild } from '@angular/core';
import { SessionService } from '../../service/session.service';
import { WebsocketService } from '../../service/websocket.service';

import { WsMessage } from '../../model/message';
import { RetrospectiveColumnData, RetrospectiveNote } from '../../model/retrospective-data';
import { User } from '../../model/Session';

@Component({
  selector: 'app-retro-session',
  templateUrl: './retro-session.component.html',
  styleUrls: ['./retro-session.component.css']
})
export class RetroSessionComponent implements OnInit {

  columnData: RetrospectiveColumnData[] = [];

  public inSession = false;
  public sessionId: string;
  public userId: number;
  public username = '';

  public users: UserInfo[] = [];

  public messages = 'Default message';
  public message = '';
  public status = '';

  constructor(private sessionService: SessionService,
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
        this.websocketService.init(this.processMessage, document.location.href);
        const wsMessage: WsMessage = { action: 'JoinSession', sessionId: this.sessionId, userId: this.userId };
        this.websocketService.send(wsMessage);
      } else {
        this.inSession = false;
        console.log('Unable to join that session!!');
      }
    });
  }
  public createSession(): void {
    this.sessionService.sessionCreate(this.username, 'RETROSPECTIVE').subscribe(
      session => {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler, document.location.href);
        const wsMessage: WsMessage = { action: 'JoinSession', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}` };
        this.websocketService.send(wsMessage);
      },
      err => console.log(err)
    );
  }

  public addMessage(): void {
    const wsMessage: WsMessage = { action: 'AddMessage', sessionId: this.sessionId, userId: this.userId, payload: this.message };
    this.websocketService.send(wsMessage);
  }

  processMessage = (message: WsMessage) => {
    switch (message.action) {
      case 'UpdateSession': this.updateUserlist(message); break;
      case 'NewMessage': this.addNewMessage(message); break;
      case 'InitRetrospective': this.initRetrospective(message); break;
      case 'UpdateNote': this.updateNote(message); break;
      case 'ERROR': this.processErrorMessage(message); break;
      default: console.log(`Unknown message action (${message.action} received.)`);
    }
  }
  processErrorMessage(message: WsMessage): void {
    switch (message.action.toUpperCase()) {
      case 'ERROR': { this.messages = `Error occured: me`; break; }
      default: console.log(`Unknown Error action ${message.action}`);
    }
  }
  private updateUserlist(message: WsMessage): void {
    this.users = this.getUsersFromMessage(message);
  }
  private getUsersFromMessage(message: WsMessage): UserInfo[] {
    return (message.payload as User[]).map(u => ({ name: u.username })).sort((u1, u2) => {
      if (u1.name > u2.name) { return 1; }
      if (u1.name < u2.name) { return -1; }
      return 0;
    });
  }
  private addNewMessage(message: WsMessage): void {
    this.messages = `${message.payload}\n${this.messages}`;
  }
  private initRetrospective(message: WsMessage): void {
    this.columnData = (message.payload as RetrospectiveColumnData[]);
  }
  private updateNote(message: WsMessage): void {
    const note = (message.payload as RetrospectiveNote);
    const columnData = this.columnData.find(colData => colData.column === note.col).notes;
    if (columnData.find(n => n.id === note.id)) {
      const index = columnData.findIndex(n => n.id === note.id);
      columnData.splice(index, 1, note);
    } else {
      columnData.push(note);
    }
  }

  addNote(colId: number): void {
    const wsMessage: WsMessage = { action: 'AddNote', sessionId: this.sessionId, userId: this.userId, payload:  colId};
    this.websocketService.send(wsMessage);
  }
  sendUpdatedNote(note: RetrospectiveNote): void {
    const wsMessage: WsMessage = { action: 'UpdateNote', sessionId: this.sessionId, userId: this.userId, payload:  note};
    this.websocketService.send(wsMessage);
  }
}
interface UserInfo {
  name: string;
}
