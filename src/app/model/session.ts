export interface Session {
    id: string;
    type: SessionType;
    user: User;
    phase?: string;
    users: UserInfo[];
}

export interface User {
    id: number;
    name: string;
    role: string;
    vote?: string;
}
export interface UserVotes {
    userid: number;
    vote: string;
}
export enum SessionType {
    UNKNOWN = 'UNKNOWN',
    REFINEMENT = 'REFINEMENT',
    RETROSPECTIVE = 'RETROSPECTIVE'
}
export interface UserInfo {
    id: number;
    name: string;
    vote?: string;
    role: string;
}
