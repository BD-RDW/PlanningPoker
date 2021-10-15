import { AbstractManager } from './abstract-manager';
import { WsMessage } from './model/message';
import { SessionMgr } from './session-manager';
import * as WebSocket from 'ws';
import { RetrospectiveInfoPerSession, RetrospectiveNote } from './model/retrospective';
import { NotesToMerge } from './model/notes-to-merge';
import { MoodboardStatus, MoodboardUpdate } from './model/moodboard-status';

export class RetrospectiveSessionMgr extends AbstractManager {
  // JoinSession        (Session)       -> User get added to the session
  // UpdateRetroSession (Session)       <- Server updates userlist ==> Join
  // AddMessage         (Session)       -> Usermessage received
  // NewMessage         (Session)       <- Server distributes message
  // InitRetrospective  (Retrospective) <- Server columns etc. to joined user
  // UpdateNotes        (Retrospective) <- Server sends newly joined user the current status
  // AddNote            (Retrospective) -> User adds new note
  // UpdateNote         (Retrospective) <- Server updates note
  // UpdateNote         (Retrospective) -> User informs Server of the updates to the note
  // EditNote           (Retrospective) -> User informs Server that the note gets changed   ==> payload: RetrospectiveNote
  // UpdateNote         (Retrospective) <- Server updates note
  // DeleteNote         (Retrospective) -> User informs Server that the note is removed     ==> payload: RetrospectiveNote
  // DeleteNote         (Retrospective) <- Server informs User that the note 1s removed     ==> payload: RetrospectiveNote
  // MergeNotes          (Retrospective) -> User informs server to merge 2 notes             ==> payload: NotesToMerge
  // UpdateNote          (Retrospective) <- Server updates note                              ==> payload: colId
  // DeleteNote          (Retrospective) <- Server informs User that the note 1s removed     ==> payload: RetrospectiveNote
  // UpdateMoodboard     (Retrospective) -> Scrummaster informs server that moodboard should be shown  ==> payload: MoodboardUpdate
  // StatusMoodboard     (Retrospective) <- Server informs User that moodboard should be shown         ==> payload: MoodboardStatus
  retrospectiveInfo: RetrospectiveInfoPerSession[] = [];

  constructor(private sessionMgr: SessionMgr) {
      super();
  }
  getSessionMgr(): SessionMgr {
      return this.sessionMgr;
  }

  processWsMessage(message: WsMessage, ws: WebSocket): void {
      switch (message.action) {
          case 'JoinSession': this.processJoinSession(message, ws); break;
          case 'AddMessage': this.processAddMessage(message, ws); break;
          case 'AddNote': this.processAddNote(message, ws); break;
          case 'UpdateNote': this.processUpdateNote(message, ws); break;
          case 'EditNote': this.processEditNote(message, ws); break;
          case 'DeleteNote': this.processDeleteNote(message, ws); break;
          case 'MergeNotes': this.processMergeNotes(message, ws); break;
          case 'UpdateMoodboard': this.processUpdateMoodboard(message, ws); break;
          default: {
              const wsMessage: WsMessage = {action: 'ERROR', payload: `Unable to process message action ${message.action}`
                  , sessionId: message.sessionId, userId: message.userId};
              ws.send(JSON.stringify(wsMessage));
              console.log('RetrospectiveSessionMgr: ERROR; Unable to proces message action: %s', message.action);
          }
      }
  }
  private processJoinSession(message: WsMessage, ws: WebSocket): void {
      this.addUserToSession(message, ws);
      this.updateRefinementStatus(message, ws);
      this.sentUpdateMoodboard(message);
  }
  private processAddMessage(message: WsMessage, ws: WebSocket): void {
      this.processMessage(message);
  }
  private updateRefinementStatus(message: WsMessage, ws: WebSocket): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;
      // tslint:disable-next-line:max-line-length
      const retroInfo: WsMessage = { action: 'InitRetrospective', sessionId: session.id, userId: message.userId, payload: retrospectiveInfo.retrospectiveData };
      ws.send(JSON.stringify(retroInfo, this.skipFields));
  }
  // AddNote       (Retrospective) -> User adds new note
  // UpdateNote    (Retrospective) <- Server updates note
  private processAddNote(message: WsMessage, ws: WebSocket): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;
      const colId = parseInt(message.payload, 10);
      const columnNotes = retrospectiveInfo.retrospectiveData.find(rd => rd.column === colId);
      let noteId = -1;
      retrospectiveInfo.retrospectiveData.forEach(col => {
        noteId = col.notes.reduce((mx, m) => mx = mx > m.id ? mx : m.id, noteId);
      });
      noteId++;
      const newNote: RetrospectiveNote = { id: noteId, col: colId, txt: '', userId: message.userId };
      columnNotes.notes.push(newNote);

      session.users.forEach(u => {
          if (u.conn) {
              const wsMessage: WsMessage = { action: 'UpdateNote', sessionId: session.id, userId: u.id, payload: newNote };
              u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
  }
  // EditNote           (Retrospective) -> User informs Server that the note gets changed   ==> payload: RetrospectiveNote
  // UpdateNote         (Retrospective) <- Server updates note
  private processEditNote(message: WsMessage, ws: WebSocket): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const note: RetrospectiveNote = message.payload;
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;
      const columnNotes = retrospectiveInfo.retrospectiveData.find(rd => rd.column === note.col);
      const editNote = columnNotes.notes.find(n => n.id === note.id);
      editNote.userId = message.userId;
      session.users.forEach(u => {
          if (u.conn) {
              const wsMessage: WsMessage = { action: 'UpdateNote', sessionId: session.id, userId: u.id, payload: editNote };
              u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
  }
  // UpdateNote    (Retrospective) -> User informs Server of the updates to the note
  // UpdateNote    (Retrospective) <- Server updates note
  private processUpdateNote(message: WsMessage, ws: WebSocket): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const note: RetrospectiveNote = message.payload;
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;
      const columnNotes = retrospectiveInfo.retrospectiveData.find(rd => rd.column === note.col);
      const index = columnNotes.notes.findIndex(n => n.id === note.id);
      columnNotes.notes.splice(index, 1, note);

      session.users.forEach(u => {
          if (u.conn) {
              const wsMessage: WsMessage = { action: 'UpdateNote', sessionId: session.id, userId: u.id, payload: note };
              u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
  }
  // DeleteNote         (Retrospective) -> User informs Server that the note is removed     ==> payload: RetrospectiveNote
  // DeleteNote         (Retrospective) <- Server informs User that the note 1s removed     ==> payload: RetrospectiveNote
  private processDeleteNote(message: WsMessage, ws: WebSocket): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const note: RetrospectiveNote = message.payload;
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;
      const columnNotes = retrospectiveInfo.retrospectiveData.find(rd => rd.column === note.col);
      const deletedNote = columnNotes.notes.find(n => n.id === note.id);
      const index = columnNotes.notes.indexOf(deletedNote, 0);
      if (index > -1) {
          columnNotes.notes.splice(index, 1);
      }
      session.users.forEach(u => {
          if (u.conn) {
              const wsMessage: WsMessage = { action: 'DeleteNote', sessionId: session.id, userId: u.id, payload: note };
              u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
  }

  // MergeNotes          (Retrospective) -> User informs server to merge 2 notes             ==> payload: NotesToMerge
  // UpdateNote          (Retrospective) <- Server updates note                              ==> payload: colId
  // DeleteNote          (Retrospective) <- Server informs User that the note 1s removed     ==> payload: RetrospectiveNote
  private processMergeNotes(message: WsMessage, ws: WebSocket): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const notes2Merge: NotesToMerge = message.payload;
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;

      const column2DeleteNoteFrom = retrospectiveInfo.retrospectiveData.find(rd => rd.notes.find(n => n.id === notes2Merge.note2MergeId));
      const baseNoteColumn        = retrospectiveInfo.retrospectiveData.find(rd => rd.notes.find(n => n.id === notes2Merge.baseNoteId));

      const mergedNote = baseNoteColumn.notes.find(n => n.id === notes2Merge.baseNoteId);
      const deletedNote = column2DeleteNoteFrom.notes.find(n => n.id === notes2Merge.note2MergeId);
      mergedNote.txt += '\n' + deletedNote.txt;
      if (deletedNote.votes) {
          mergedNote.votes = mergedNote.votes ? mergedNote.votes + deletedNote.votes : deletedNote.votes;
      }
      const index = column2DeleteNoteFrom.notes.indexOf(deletedNote, 0);
      if (index > -1) {
          column2DeleteNoteFrom.notes.splice(index, 1);
      }
      session.users.forEach(u => {
          if (u.conn) {
              let wsMessage: WsMessage = { action: 'DeleteNote', sessionId: session.id, userId: u.id, payload: deletedNote };
              u.conn.send(JSON.stringify(wsMessage, this.skipFields));
              wsMessage = { action: 'UpdateNote', sessionId: session.id, userId: u.id, payload: mergedNote };
              u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
  }

  // UpdateMoodboard     (Retrospective) -> Scrummaster informs server that moodboard should be shown  ==> payload: MoodboardUpdate
  // StatusMoodboard     (Retrospective) <- Server informs User that moodboard should be shown         ==> payload: MoodboardStatus
  private processUpdateMoodboard(message: WsMessage, ws: WebSocket): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const status = message.payload as MoodboardUpdate;
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;
      retrospectiveInfo.showMoodboard = status.display;
      if (! retrospectiveInfo.moodboardValues) {
        retrospectiveInfo.moodboardValues = new Array(status.arraySize);
        for (let i = 0; i < retrospectiveInfo.moodboardValues.length; i++) {
          retrospectiveInfo.moodboardValues[i] = 0;
        }
      }
      if (status.previousvalue !== undefined) {
        retrospectiveInfo.moodboardValues[status.previousvalue]--;
      }
      if (status.currentValue !== undefined) {
        retrospectiveInfo.moodboardValues[status.currentValue]++;
      }
      this.sentUpdateMoodboard(message);
  }
  private sentUpdateMoodboard(message: WsMessage): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      const retrospectiveInfo = session.sessionTypeData as RetrospectiveInfoPerSession;
      const statusMessage: MoodboardStatus = {display: retrospectiveInfo.showMoodboard, values: retrospectiveInfo.moodboardValues };
      session.users.forEach(u => {
          if (u.conn) {
              const wsMessage: WsMessage = { action: 'StatusMoodboard', sessionId: session.id, userId: u.id, payload: statusMessage };
              u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
  }
}
