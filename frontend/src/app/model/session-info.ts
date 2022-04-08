export interface SessionInfo {
    username: string;
    sessionId: string;
    state: SessionConnectType;
}
export enum SessionConnectType {
    NEW='New',
    EXISTING='Existing'
}