export interface Session {
    sessionId: string;
    userId: number;
    username: string;
    users: User[];
}

export interface User {
    id: number;
    username: string;
    role: string;
}
