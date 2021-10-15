import { ReportingService } from './reporting-service';
import { Session, User, Role, SessionType } from './model/session';
import { RefinementInfoPerSession, RefinementPhase } from './model/refinement';
import { RetrospectiveInfoPerSession } from './model/retrospective';

export class SessionMgr {
    private sessions: Session[] = [];
    private users: User[] = [];
    private reportingService = new ReportingService(this);

    constructor() {
        console.log('SessionMgr - constructor');
    }

    public addUser(user: User, session: Session): number {
        if (this.users.length === 0) {
            user.id = 1;
        } else {
            user.id = this.users.reduce((s, t) => s.id > t.id ? s : t).id + 1;
        }
        this.users.push(user);
        session.users.push(user);
        this.reportingService.signalChanges();
        return user.id;
    }
    public findUser(id: number): User {
        return this.users.find(u => u.id === id);
    }
    public newSession(sessionType: string, user: User): string {
        let sessionId = Math.random().toString(36).substring(2, 14);
        while (this.findSession(sessionId)) {
            sessionId = Math.random().toString(36).substring(2, 14);
        }
        let sessionData;
        switch (sessionType) {
            case SessionType.RETROSPECTIVE : sessionData = this.createRetrospectiveSessionData(); break;
            case SessionType.REFINEMENT : sessionData = this.createRefinementSessionData(); break;
        }
        const session: Session = { id: sessionId, type: sessionType.toUpperCase(), users: [], sessionTypeData: sessionData };
        this.sessions.push(session);
        this.addUser(user, session);
        this.reportingService.signalChanges();
        return session.id;
    }
    public findSession(id: string): Session {
        return this.sessions.find(s => s.id === id);
    }
    public findSessionForUser(id: number): Session {
        let session: Session;
        this.sessions.find(s => {if (s.users.find(u => u.id === id)) {session = s; }});
        return session;
    }
    getAllSessionsAsString(): string {
        return JSON.stringify(this.sessions, this.skipFields);
    }
    getAllSessions(): Session[] {
        return this.sessions;
    }
    public getAllUsers(): User[] {
        return this.users;
    }
    public deleteUser(user: User): void {
        const session = this.findSessionForUser(user.id);
        let index = session.users.indexOf(user, 0);
        session.users.splice(index, 1);

        index = this.users.indexOf(user, 0);
        this.users.splice(index, 1);
        this.reportingService.signalChanges();
    }

    delete(session: Session): void {
        const index = this.sessions.indexOf(session);
        if (index >= 0) {
            this.sessions.splice(index, 1);
            this.reportingService.signalChanges();
        }
        this.reportingService.signalChanges();
    }
    skipFields(k: any, v: any): any {
        if (k === 'conn') { return undefined; } return v;
    }

    createRetrospectiveSessionData(): RetrospectiveInfoPerSession {
        return {
            showMoodboard: false,
            moodboardValues: null,
            retrospectiveData: [
                { column: 1, title: 'What went well', notes: [] },
                { column: 2, title: 'What could be improved', notes: [] },
                { column: 3, title: 'Actions', notes: [] }
            ]
        };
    }
    createRefinementSessionData(): RefinementInfoPerSession {
        return { phase: RefinementPhase.Voting, userInfo: [] };
    }

}
