import * as WebSocket from 'ws';
import { ReportingService } from './reporting-service';

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
        const session: Session = { id: sessionId, type: sessionType.toUpperCase(), users: [ ], showMoodboard: false };
        this.sessions.push(session);
        user.role = Role.ScrumMaster;
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

}

export interface Session {
    id: string;
    type: string;
    phase?: string;
    users: User[];
    showMoodboard: boolean;
    moodboardValues?: number[];
}

export interface User {
    id: number;
    name: string;
    role: Role;
    conn?: WebSocket;
}

export enum Role {
    Unknown = 'Unknown',
    ScrumMaster = 'ScrumMaster',
    TeamMember = 'TeamMember'
}
