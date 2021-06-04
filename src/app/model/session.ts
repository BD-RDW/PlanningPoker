export interface Session {
    sessionId: string;
    userId: number;
    username: string;
    phase: string;
    users: User[];
}

export interface User {
    id: number;
    username: string;
    role: string;
    vote?: string;
}
export interface UserVotes {
    userid: number;
    vote: string;
}
export enum SessionType {
    REFINEMENT = 'REFINEMENT',
    RETROSPECTIVE = 'RETROSPECTIVE'
}
