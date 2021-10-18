import { WsMessage } from './model/message';
import { SessionMgr } from './session-manager';
import { Session } from './model/session';
import * as WebSocket from 'ws';
import { RefinementInfoPerSession } from './model/refinement';

export abstract class AbstractManager {
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
        const user = this.getSessionMgr().findUser(message.userId);
        user.conn = ws;
        this.updateSessionInfo(session);
    }
    // AddMessage    (Session)       -> Usermessage received
    // NewMessage    (Session)       <- Server distributes message
    processMessage(message: WsMessage): void {
        const session = this.getSessionMgr().findSession(message.sessionId);
        if (session && session.users) {
            session.users.forEach(u => {
                if (u.conn) {
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
        let planningSessionInfo;
        switch (session.type) {
            case 'REFINEMENT': action = 'UpdatePlanSession'; planningSessionInfo = session.sessionTypeData; break;
            case 'RETROSPECTIVE': action = 'UpdateRetroSession'; break;
            default: console.log(`updateSessionInfo: Unable to update session: Unknown session type ${session.type}`);
                     console.log(`Session: ${JSON.stringify(session)}`);
                     return;
        }
        
        let users = session.users.map(u => {
            let ui = (session.sessionTypeData as RefinementInfoPerSession).userInfo.filter(ui => ui.userid === u.id);
            let vote = ui && ui.length > 0 ? ui[0].vote : undefined;
            return { id: u.id, name: u.name, role: u.role, vote: vote};
        });
        session.users.forEach(u2 => {
            if (u2.conn) {
                const sessionInfo: WsMessage = { action, sessionId: session.id, userId: u2.id, payload: users };
                u2.conn.send(JSON.stringify(sessionInfo, this.skipFields));
            }
        });
    }
}
