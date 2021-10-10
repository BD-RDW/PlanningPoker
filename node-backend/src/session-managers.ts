import { WsMessage } from './model/message';
import { Session, SessionMgr } from './session';
import * as WebSocket from 'ws';
import { RetrospectiveInfoPerSession, RetrospectiveNote } from './model/retrospective';
import { RefinementInfoPerSession } from './model/refinement';
import { NotesToMerge } from './model/notes-to-merge';
import { MoodboardStatus, MoodboardUpdate } from './model/moodboard-status';

abstract class AbstractManager {
    // JoinSession   (Session)       -> User get added to the session
    // UpdateSession (Session)       <- Server updates userlist ==> Join
    // AddMessage    (Session)       -> Usermessage received
    // NewMessage    (Session)       <- Server distributes message
    abstract getSessionMgr(): SessionMgr;

    constructor() {
        this.initConnectionCleanup();
    }

    // JoinSession   (Session)       -> User get added to the szession
    // UpdateSession (Session)       <- Server updates userlist ==> Join
    addUserToSession(message: WsMessage, ws: WebSocket): void {
        const session = this.getSessionMgr().findSessionForUser(message.userId);
        this.getSessionMgr().findUser(message.userId).conn = ws;
        this.updateSessionInfo(session);
    }
    // AddMessage    (Session)       -> Usermessage received
    // NewMessage    (Session)       <- Server distributes message
    processMessage(message: WsMessage): void {
        const session = this.getSessionMgr().findSession(message.sessionId);
        if (session && session.users) {
            session.users.forEach(u => {
                if (u.conn) {
                    const username = this.getSessionMgr().findUser(message.userId).name;
                    const wsMessage: WsMessage = { action: 'NewMessage', sessionId: session.id, userId: u.id, payload: message.payload };
                    u.conn.send(JSON.stringify(wsMessage, this.skipFields));
                }
            });
        }
    }
    skipFields(k: any, v: any): any {
        if (k === 'conn') { return undefined; } return v;
    }
    deleteSession(sessionId: string): void {
        const session = this.getSessionMgr().findSession(sessionId);
        if (session) {
            this.getSessionMgr().delete(session);
        }
    }
    initConnectionCleanup(): void {
        setInterval(() =>
            this.getSessionMgr().getAllUsers().forEach(u => {
                let session: Session = null;
                if (u.conn) {
                    if (u.conn.readyState === WebSocket.CLOSED) {
                        session = this.getSessionMgr().findSessionForUser(u.id);
                        this.getSessionMgr().deleteUser(u);
                    }
                } else {
                    session = this.getSessionMgr().findSessionForUser(u.id);
                    this.getSessionMgr().deleteUser(u);
                }
                if (session) {
                    if (session.users.length === 0) {
                        this.getSessionMgr().delete(session);
                    } else {
                        this.updateSessionInfo(session);
                    }
                }
            }), 60000);
    }
    updateSessionInfo(session: Session): void {
        let action = 'Unknown';
        switch (session.type) {
            case 'REFINEMENT': action = 'UpdatePlanSession'; break;
            case 'RETROSPECTIVE': action = 'UpdateRetroSession'; break;
            default: console.log(`updateSessionInfo: Unable to update session: Unknown session type ${session.type}`);
                     console.log(`Session: ${JSON.stringify(session)}`);
                     return;
        }
        session.users.forEach(u2 => {
            if (u2.conn) {
                const sessionInfo: WsMessage = { action, sessionId: session.id, userId: u2.id, payload: session.users };
                u2.conn.send(JSON.stringify(sessionInfo, this.skipFields));
            }
        });
    }
}

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
        let retrospectiveSession = this.retrospectiveInfo.find(ri => ri.sessionId === message.sessionId);
        if (!retrospectiveSession) {
            retrospectiveSession = {
                sessionId: message.sessionId, retrospectiveData: [
                    { column: 1, title: 'What went well', notes: [] },
                    { column: 2, title: 'What could be improved', notes: [] },
                    { column: 3, title: 'Actions', notes: [] }
                ]
            };
            this.retrospectiveInfo.push(retrospectiveSession);
        }
        // tslint:disable-next-line:max-line-length
        const retroInfo: WsMessage = { action: 'InitRetrospective', sessionId: session.id, userId: message.userId, payload: retrospectiveSession.retrospectiveData };
        ws.send(JSON.stringify(retroInfo, this.skipFields));
    }
    // AddNote       (Retrospective) -> User adds new note
    // UpdateNote    (Retrospective) <- Server updates note
    private processAddNote(message: WsMessage, ws: WebSocket): void {
        const session = this.sessionMgr.findSessionForUser(message.userId);
        const colId = parseInt(message.payload, 10);
        const retrospectiveInfo = this.retrospectiveInfo.find(ri => ri.sessionId === message.sessionId);
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
        const retrospectiveInfo = this.retrospectiveInfo.find(ri => ri.sessionId === message.sessionId);
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
        const retrospectiveInfo = this.retrospectiveInfo.find(ri => ri.sessionId === message.sessionId);
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
        const retrospectiveInfo = this.retrospectiveInfo.find(ri => ri.sessionId === message.sessionId);
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
        const retrospectiveInfo = this.retrospectiveInfo.find(ri => ri.sessionId === message.sessionId);

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
        session.showMoodboard = status.display;
        if (! session.moodboardValues) {
            session.moodboardValues = new Array(status.arraySize);
            for (let i = 0; i < session.moodboardValues.length; i++) {
                session.moodboardValues[i] = 0;
            }
        }
        if (status.previousvalue !== undefined) {
            session.moodboardValues[status.previousvalue]--;
        }
        if (status.currentValue !== undefined) {
            session.moodboardValues[status.currentValue]++;
        }
        this.sentUpdateMoodboard(message);
    }
    private sentUpdateMoodboard(message: WsMessage): void {
        const session = this.sessionMgr.findSessionForUser(message.userId);
        const statusMessage: MoodboardStatus = {display: session.showMoodboard, values: session.moodboardValues };
        session.users.forEach(u => {
            if (u.conn) {
                const wsMessage: WsMessage = { action: 'StatusMoodboard', sessionId: session.id, userId: u.id, payload: statusMessage };
                u.conn.send(JSON.stringify(wsMessage, this.skipFields));
            }
        });
    }
}

export class RefinementSessionMgr extends AbstractManager {
    // JoinSession       (Session)       -> User get added to the szession
    // UpdatePlanSession (Session)       <- Server updates userlist ==> Join
    // AddMessage        (Session)       -> Usermessage received
    // NewMessage        (Session)       <- Server distributes message
    // EnterVote         (Refinement)    -> User enters vote
    // UpdateVotes       (Refinement)    <- Server updates user votes ==> Vote
    // SwitchPhase       (Refinement)    -> Scrummaster switches phase
    // UpdatePhase       (Refinement)    <- Server updates phase

    refinementInfo: RefinementInfoPerSession[] = [];

    constructor(private sessionMgr: SessionMgr) {
        super();
    }
    getSessionMgr(): SessionMgr {
        return this.sessionMgr;
    }
    public processWsMessage(message: WsMessage, ws: WebSocket): void {
        switch (message.action) {
            case 'JoinSession': this.processJoinSession(message, ws); break;
            case 'AddMessage': this.processAddMessage(message); break;
            case 'EnterVote': this.processEnterVote(message); break;
            case 'SwitchPhase': this.processSwitchPhase(message); break;
            default: {
                const wsMessage: WsMessage = {action: 'ERROR', payload: `Unable to process message action ${message.action}`
                , sessionId: message.sessionId, userId: message.userId };
                ws.send(wsMessage);
                console.log('RetrospectiveSessionMgr: ERROR; Unable to proces message action: %s', message.action);
            }
        }
    }
    private processJoinSession(message: WsMessage, ws: WebSocket): void {
        this.addUserToSession(message, ws);
        this.updatePhaseForUser(message);
        this.updateVotesForUser(message);
    }
    private processAddMessage(message: WsMessage): void {
        this.processMessage(message);
    }
    private updatePhaseForUser(message: WsMessage): void {
        const session = this.sessionMgr.findSessionForUser(message.userId);
        let refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
        if ( ! refinementInfo ) {
            refinementInfo = { sessionId: message.sessionId, phase: 'voting', userInfo: [] };
            this.refinementInfo.push(refinementInfo);
        }
        // tslint:disable-next-line:max-line-length
        const wsMessage: WsMessage = {action: 'UpdatePhase', sessionId: message.sessionId, userId: message.userId, payload: refinementInfo.phase};
        session.users.find(u => u.id === message.userId).conn.send(JSON.stringify(wsMessage, this.skipFields));
    }
    private updateVotesForUser(message: WsMessage): void {
        const refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
        const session = this.sessionMgr.findSessionForUser(message.userId);
        // tslint:disable-next-line:max-line-length
        const wsMessage: WsMessage = {action: 'UpdateVotes', sessionId: session.id, userId: message.userId, payload: refinementInfo.userInfo };
        session.users.find(u =>  u.id === message.userId).conn.send(JSON.stringify(wsMessage, this.skipFields));
    }
    // EnterVote     (Refinement)    -> User enters vote
    // UpdateVotes   (Refinement)    <- Server updates user votes ==> Vote
    private processEnterVote(message: WsMessage): void {
        const vote = message.payload;
        const refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
        let userInfo = refinementInfo.userInfo.find(u => u.userid === message.userId);
        if (! userInfo) {
            userInfo = { userid: message.userId, vote: message.payload };
            refinementInfo.userInfo.push(userInfo);
        }
        else { userInfo.vote = vote; }
        const session = this.sessionMgr.findSessionForUser(message.userId);
        session.users.forEach(u => {
            const wsMessage: WsMessage = {action: 'UpdateVotes', sessionId: session.id, userId: u.id, payload: refinementInfo.userInfo };
            if (u.conn) { u.conn.send(JSON.stringify(wsMessage, this.skipFields));
            }
        });
    }
    // SwitchPhase   (Refinement)    -> Scrummaster switches phase
    // UpdatePhase   (Refinement)    <- Server updates phase
    private processSwitchPhase(message: WsMessage): void {
        const phase = message.payload;
        const refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
        refinementInfo.phase = phase;
        const session = this.sessionMgr.findSessionForUser(message.userId);
        session.users.forEach(u => {
            const wsMessage: WsMessage = {action: 'UpdatePhase', sessionId: session.id, userId: u.id, payload: refinementInfo.phase };
            if (u.conn) { u.conn.send(JSON.stringify(wsMessage, this.skipFields));
            }
        });
        if (refinementInfo.phase === 'voting') {
            refinementInfo.userInfo = [];
            session.users.forEach(u => {
                const wsMessage = {action: 'UpdateVotes', sessionId: session.id, userId: u.id, payload: refinementInfo.userInfo };
                if (u.conn) { u.conn.send(JSON.stringify(wsMessage, this.skipFields));
                }
            });
        }
    }
}
