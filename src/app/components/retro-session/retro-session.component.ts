import { Component, OnInit, ViewChild } from '@angular/core';
import { SessionService } from '../../service/session.service';
import { WebsocketService } from '../../service/websocket.service';

import { WsMessage } from '../../model/message';
import { RetrospectiveColumnData, RetrospectiveNote } from '../../model/retrospective-data';
import { User, SessionType } from '../../model/session';
import { saveAs } from '../../../../node_modules/file-saver';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as moment from 'moment';
import { NotesToMerge } from 'src/app/model/notes-to-merge';

@Component({
  selector: 'app-retro-session',
  templateUrl: './retro-session.component.html',
  styleUrls: ['./retro-session.component.css']
})
export class RetroSessionComponent implements OnInit {

  public newMessage: Subject<string> = new BehaviorSubject<string>('Status...');

  columnData: RetrospectiveColumnData[] = [];

  public inSession = false;
  public sessionId: string;
  public userId: number;
  public username = '';

  public users: UserInfo[] = [];

  public messages = 'Default message';
  public message = '';
  public status = '';
  public availableVotes = 5;

  public display = false;

  private actions: string[] = ['UpdateRetroSession', 'NewMessage', 'InitRetrospective', 'UpdateNote', 'DeleteNote'];

  constructor(private sessionService: SessionService,
              private websocketService: WebsocketService) { }

  ngOnInit(): void {
    this.inSession = false;
    this.sessionId = null;
  }

  public joinSession(): void {
    this.sessionService.joinSession(SessionType.RETROSPECTIVE, this.sessionId, this.username).subscribe(session => {
      if (session) {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        this.websocketService.init(this.processMessage, this.sessionId, this.actions, document.location.href);
        const wsMessage: WsMessage = { action: 'JoinSession', sessionId: this.sessionId, userId: this.userId };
        this.websocketService.send(wsMessage);
      } else {
        this.inSession = false;
        console.log('Unable to join that session!!');
        this.status = 'Unable to join that session';
      }
    },
    err => {
      this.inSession = false;
      console.log('Unable to join that session!!');
      this.status = 'Unable to join that session';
  });
  }
  public createSession(): void {
    this.sessionService.sessionCreate(this.username, SessionType.RETROSPECTIVE).subscribe(
      session => {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler, this.sessionId, this.actions, document.location.href);
        const wsMessage: WsMessage = { action: 'JoinSession', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}` };
        this.websocketService.send(wsMessage);
      },
      err => {
        this.inSession = false;
        console.log('Unable to join that session!!');
        this.status = 'Unable to join that session';
      }
    );
  }

  public addMessage($event): void {
    const wsMessage: WsMessage = { action: 'AddMessage', sessionId: this.sessionId, userId: this.userId, payload: $event };
    this.websocketService.send(wsMessage);
  }

  processMessage = (message: WsMessage) => {
    switch (message.action) {
      case 'UpdateRetroSession': this.updateUserlist(message); break;
      case 'NewMessage': this.addNewMessage(message); break;
      case 'InitRetrospective': this.initRetrospective(message); break;
      case 'UpdateNote': this.updateNote(message); break;
      case 'DeleteNote': this.deleteNote(message); break;
      default: console.log(`RetroSessionComponent.processMessage: Unknown message action (${message.action}) received.`);
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
    this.newMessage.next(message.payload);
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
  private deleteNote(message: WsMessage): void {
    const note = (message.payload as RetrospectiveNote);
    const columnData = this.columnData.find(colData => colData.column === note.col).notes;
    const index = columnData.findIndex(n => n.id === note.id);
    columnData.splice(index, 1);
  }

  addNote(colId: number): void {
    const wsMessage: WsMessage = { action: 'AddNote', sessionId: this.sessionId, userId: this.userId, payload:  colId};
    this.websocketService.send(wsMessage);
  }
  sendUpdatedNote(note: RetrospectiveNote): void {
    const wsMessage: WsMessage = { action: 'UpdateNote', sessionId: this.sessionId, userId: this.userId, payload:  note};
    this.websocketService.send(wsMessage);
  }
  sendEditNote(note: RetrospectiveNote): void {
    const wsMessage: WsMessage = { action: 'EditNote', sessionId: this.sessionId, userId: this.userId, payload:  note};
    this.websocketService.send(wsMessage);
  }
  sendDeleteNote(note: RetrospectiveNote): void {
    const wsMessage: WsMessage = { action: 'DeleteNote', sessionId: this.sessionId, userId: this.userId, payload:  note};
    this.websocketService.send(wsMessage);
  }
  public voted($event): void {
    this.availableVotes--;
    this.sendUpdatedNote($event);
  }
  public auxilaryMenu(): void {
    const nodeTexts: string[] = this.columnData.map(cd => cd.title + '\n' + cd.notes.map(n => '\t' + n.txt + '\n') + '\n\n');
    const blob = new Blob(nodeTexts, {type: 'text/plain;charset=utf-8'});
    const filename = 'RetrospectiveNotes_' + moment(Date.now()).format('YYYYMMDD_HHmmss') + '.txt';
    saveAs(blob, filename);
  }
  public mergeNotes(notes2Merge: NotesToMerge): void {
    console.log(`Merging note ${notes2Merge.note2MergeId} into note ${notes2Merge.baseNoteId}`);
    console.log(JSON.stringify(notes2Merge));
    const wsMessage: WsMessage = { action: 'MergeNotes', sessionId: this.sessionId, userId: this.userId, payload:  notes2Merge};
    this.websocketService.send(wsMessage);
  }
}
interface UserInfo {
  name: string;
}
