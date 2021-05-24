export interface RefinementInfoPerSession {
  sessionId: string;
  phase: string;
  userInfo: RefinementUserInfo[];
}

export interface RefinementUserInfo {
  userid: number;
  vote: string;
}
