import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { WebsocketService } from './websocket.service';
import { WsMessage } from '../model/message';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotesToMerge } from 'src/app/model/notes-to-merge';

import { RetrospectiveColumnData, RetrospectiveNote, MoodboardStatus, MoodboardUpdate } from '../model/retrospective-data';
import { User, SessionType, Session, Role } from '../model/session';
import { SessionInfo } from 'src/app/model/session-info';

@Injectable({
  providedIn: 'root'
})
export class RetroSessionService {

  public newMessage: Subject<string> = new BehaviorSubject<string>('Status...');

  columnData: RetrospectiveColumnData[] = [];

  public inSession = false;
  public session: Session =
      {id: null, type: SessionType.UNKNOWN, user: {id: null, name: null, role: null, vote: null}, phase: null,  users: []};
  public availableVotes = 5;

  public showMoodboard = false;
  public moodboardSelected: number;
  public moodboardCounts: number[] = [];

  draggedMessage: RetrospectiveNote;

  private actions: string[] = ['UpdateRetroSession', 'NewMessage', 'InitRetrospective', 'UpdateNote', 'DeleteNote', 'StatusMoodboard'];


  constructor(private sessionService: SessionService,
              private websocketService: WebsocketService) { }

  public joinSession(sessionInfo: SessionInfo): Observable<boolean> {
    return this.sessionService.joinSession(SessionType.RETROSPECTIVE, sessionInfo.sessionId, sessionInfo.username).pipe(
      map(session => {
        if (session) {
          this.inSession = true;
          this.session = JSON.parse(JSON.stringify(session));
          this.websocketService.init(this.processMessage, this.session.id, this.actions, document.location.href);
          const wsMessage: WsMessage = { action: 'JoinSession', sessionId: this.session.id, userId: this.session.user.id };
          this.websocketService.send(wsMessage);
        } else {
          this.inSession = false;
        }
        return this.inSession;
      }),
      catchError(() => {
        this.inSession = false;
        this.session = undefined;
        return of(this.inSession);
      })
    );
  }
  public createSession(sessionInfo: SessionInfo): Observable<boolean> {
    return this.sessionService.sessionCreate(sessionInfo.username, SessionType.RETROSPECTIVE).pipe(
      map(session => {
        this.inSession = true;
        this.session = JSON.parse(JSON.stringify(session));
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler, this.session.id, this.actions, document.location.href);
        const wsMessage: WsMessage = { action: 'JoinSession', sessionId: this.session.id, userId: this.session.user.id, payload: `Joining session ${this.session.id}` };
        this.websocketService.send(wsMessage);
        return true;
      }),
      catchError(() => {
        this.inSession = false;
        this.session = undefined;
        return of(this.inSession);
      })
    );
  }
  public addMessage($event): void {
    const wsMessage: WsMessage = { action: 'AddMessage', sessionId: this.session.id, userId: this.session.user.id, payload: $event };
    this.websocketService.send(wsMessage);
  }
  public moodboardStatusUpdate(countSize: number): void {
    const moodboardUpdate: MoodboardUpdate = {display: !this.showMoodboard, arraySize: countSize};
    const wsMessage: WsMessage = { action: 'UpdateMoodboard'
        , sessionId: this.session.id, userId: this.session.user.id, payload: moodboardUpdate };
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
      case 'StatusMoodboard': this.moodboardStatus(message); break;
      default: console.log(`RetroSessionComponent.processMessage: Unknown message action (${message.action}) received.`);
    }
  }
  private moodboardStatus(message: WsMessage): void {
    const mbStatus = message.payload as MoodboardStatus;
    this.showMoodboard = mbStatus.display;
    this.moodboardCounts = mbStatus.values;
  }
  private updateUserlist(message: WsMessage): void {
    this.session.users = this.getUsersFromMessage(message);
    if (! this.session.user.role) {
      this.session.user.role = this.session.users.find(u => u.id === this.session.user.id).role;
    }
  }
  private getUsersFromMessage(message: WsMessage): User[] {
    return (message.payload as User[]).map(u => ({ name: u.name, role: u.role, vote: null, id: u.id })).sort((u1, u2) => {
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
    const wsMessage: WsMessage = { action: 'AddNote', sessionId: this.session.id, userId: this.session.user.id, payload:  colId};
    this.websocketService.send(wsMessage);
  }
  sendUpdatedNote(note: RetrospectiveNote): void {
    const wsMessage: WsMessage = { action: 'UpdateNote', sessionId: this.session.id, userId: this.session.user.id, payload:  note};
    this.websocketService.send(wsMessage);
  }
  sendEditNote(note: RetrospectiveNote): void {
    const wsMessage: WsMessage = { action: 'EditNote', sessionId: this.session.id, userId: this.session.user.id, payload:  note};
    this.websocketService.send(wsMessage);
  }
  sendDeleteNote(note: RetrospectiveNote): void {
    const wsMessage: WsMessage = { action: 'DeleteNote', sessionId: this.session.id, userId: this.session.user.id, payload:  note};
    this.websocketService.send(wsMessage);
  }
  mergeNotes(notes2Merge: NotesToMerge): void {
    const wsMessage: WsMessage = { action: 'MergeNotes', sessionId: this.session.id, userId: this.session.user.id, payload:  notes2Merge};
    this.websocketService.send(wsMessage);
  }

  isAdmin(): boolean {
    return this.session.user.role === Role.ScrumMaster;
  }

  myMoodSelection(selection: number): void {
    const moodboardUpdate: MoodboardUpdate = {display: this.showMoodboard, arraySize: this.moodboardCounts.length
      , previousvalue: this.moodboardSelected, currentValue: selection};
    const wsMessage: WsMessage = { action: 'UpdateMoodboard'
        , sessionId: this.session.id, userId: this.session.user.id, payload: moodboardUpdate };
    this.moodboardSelected = selection;
    this.websocketService.send(wsMessage);
  }
}
