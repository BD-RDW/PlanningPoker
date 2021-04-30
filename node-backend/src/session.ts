import * as WebSocket from 'ws';

export class SessionMgr {
    private sessions: Session[] = [];
    private users: User[] = [];

    public addUser(user: User, session: Session): number {
        if (this.users.length === 0) {
            user.id = 1;
        } else {
            user.id = this.users.reduce((s, t) => s.id > t.id ? s : t).id + 1;
        }
        this.users.push(user);
        session.users.push(user);
        return user.id;
    }
    public findUser(id: number): User {
        return this.users.find(u => u.id === id);
    }
    public newSession(user: User): string {
        let sessionId = Math.random().toString(36).substring(2, 14);
        while (this.findSession(sessionId)) {
            sessionId = Math.random().toString(36).substring(2, 14);
        }
        const session: Session = { id: sessionId, users: [ ] };
        this.sessions.push(session);
        user.role = Role.Admin;
        this.addUser(user, session);
        return session.id;
    }
    public findSession(id: string): Session {
        return this.sessions.find(s => s.id === id);
    }
    public findSessionForUser(id: number): Session {
        return this.sessions.find(s => s.users.find(u => u.id === id));
    }
}

export interface Session {
    id: string;
    users: User[];
}

export interface User {
    id: number;
    username: string;
    role: Role;
    conn?: WebSocket;
}

export enum Role {
    Unknown, Admin, User
}
