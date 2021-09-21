import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { WebsocketService } from './websocket.service';
import { WsMessage } from '../model/message';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotesToMerge } from 'src/app/model/notes-to-merge';

import { RetrospectiveColumnData, RetrospectiveNote } from '../model/retrospective-data';
import { User, SessionType } from '../model/session';

@Injectable({
  providedIn: 'root'
})
export class RetroSessionServiceService {

  public newMessage: Subject<string> = new BehaviorSubject<string>('Status...');

  columnData: RetrospectiveColumnData[] = [];

  public inSession = false;
  public sessionId: string;
  public userId: number;
  public username = '';
  public availableVotes = 5;

  private draggedMessage: RetrospectiveNote;

  public users: UserInfo[] = [];

  private actions: string[] = ['UpdateRetroSession', 'NewMessage', 'InitRetrospective', 'UpdateNote', 'DeleteNote'];


  constructor(private sessionService: SessionService,
              private websocketService: WebsocketService) { }

  public joinSession(): Observable<boolean> {
    return this.sessionService.joinSession(SessionType.RETROSPECTIVE, this.sessionId, this.username).pipe(
      map(session => {
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
        }
        return this.inSession;
      }),
      catchError(() => {
        this.inSession = false;
        return of(this.inSession);
      })
    );
  }
  public createSession(): Observable<boolean> {
    return this.sessionService.sessionCreate(this.username, SessionType.RETROSPECTIVE).pipe(
      map(session => {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler, this.sessionId, this.actions, document.location.href);
        const wsMessage: WsMessage = { action: 'JoinSession', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}` };
        this.websocketService.send(wsMessage);
        return true;
      }),
      catchError(() => {
        this.inSession = false;
        return of(this.inSession);
      })
    );
  }
  public addMessage($event): void {
    const wsMessage: WsMessage = { action: 'AddMessage', sessionId: this.sessionId, userId: this.userId, payload: $event };
    this.websocketService.send(wsMessage);
  }
  public voted($event): void {
    this.availableVotes--;
    this.sendUpdatedNote($event);
  }

  public setDraggedMessage(message: RetrospectiveNote): void {
    this.draggedMessage = message;
  }
  public getDraggedMessageId(): number {
    if (this.draggedMessage) {
      return this.draggedMessage.id;
    }
    return undefined;
  }
  public resetDraggedMessage(): void {
    this.draggedMessage = undefined;
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
  public mergeNotes(notes2Merge: NotesToMerge): void {
    const wsMessage: WsMessage = { action: 'MergeNotes', sessionId: this.sessionId, userId: this.userId, payload:  notes2Merge};
    this.websocketService.send(wsMessage);
  }

}
interface UserInfo {
  name: string;
}