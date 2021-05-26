import { WsMessage } from './model/message';
import { SessionMgr } from './session';
import * as WebSocket from 'ws';
import { RetrospectiveInfoPerSession, RetrospectiveNote } from './model/retrospective';
import { RefinementInfoPerSession } from './model/refinement';

abstract class AbstractManager {
    // JoinSession   (Session)       -> User get added to the session
    // UpdateSession (Session)       <- Server updates userlist ==> Join
    // AddMessage    (Session)       -> Usermessage received
    // NewMessage    (Session)       <- Server distributes message
    abstract getSessionMgr(): SessionMgr;

    // JoinSession   (Session)       -> User get added to the szession
    // UpdateSession (Session)       <- Server updates userlist ==> Join
    addUserToSession(message: WsMessage, ws: WebSocket): void {
        const session = this.getSessionMgr().findSessionForUser(message.userId);
        this.getSessionMgr().findUser(message.userId).conn = ws;
        session.users.forEach(u => {
            if (u.conn) {
                const sessionInfo: WsMessage = { action: 'UpdateSession', sessionId: session.id, userId: u.id, payload: session.users };
                u.conn.send(JSON.stringify(sessionInfo, this.skipFields));
            }
        });
    }
    // AddMessage    (Session)       -> Usermessage received
    // NewMessage    (Session)       <- Server distributes message
    processMessage(message: WsMessage): void {
        const session = this.getSessionMgr().findSessionForUser(message.userId);
        session.users.forEach(u => {
            if (u.conn) {
                const username = this.getSessionMgr().findUser(message.userId).username;
                const wsMessage: WsMessage = { action: 'NewMessage', sessionId: session.id, userId: u.id, payload: message.payload };
                u.conn.send(JSON.stringify(wsMessage, this.skipFields));
            }
        });
    }
    skipFields(k: any, v: any): any {
        if (k === 'conn') { return undefined; } return v;
    }

}

export class RetrospectiveSessionMgr extends AbstractManager {
    // JoinSession   (Session)       -> User get added to the session
    // UpdateSession (Session)       <- Server updates userlist ==> Join
    // AddMessage    (Session)       -> Usermessage received
    // NewMessage    (Session)       <- Server distributes message
    // InitRetrospective   (Retrospective) <- Server columns etc. to joined user
    // UpdateNotes   (Retrospective) <- Server sends newly joined user the current status
    // AddNote       (Retrospective) -> User adds new note
    // UpdateNote    (Retrospective) <- Server updates note
    // UpdateNote    (Retrospective) -> User informs Server of the updates to the note

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
        const newNote: RetrospectiveNote = { id: noteId, col: colId, txt: ' ', userId: message.userId };
        columnNotes.notes.push(newNote);

        session.users.forEach(u => {
            if (u.conn) {
                const wsMessage: WsMessage = { action: 'UpdateNote', sessionId: session.id, userId: u.id, payload: newNote };
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
}

export class RefinementSessionMgr extends AbstractManager {
    // JoinSession   (Session)       -> User get added to the szession
    // UpdateSession (Session)       <- Server updates userlist ==> Join
    // AddMessage    (Session)       -> Usermessage received
    // NewMessage    (Session)       <- Server distributes message
    // EnterVote     (Refinement)    -> User enters vote
    // UpdateVotes   (Refinement)    <- Server updates user votes ==> Vote
    // SwitchPhase   (Refinemnet)    -> Scrummaster switches phase
    // UpdatePhase   (Refinement)    <- Server updates phase

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
    // SwitchPhase   (Refinemnet)    -> Scrummaster switches phase
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
    }
}