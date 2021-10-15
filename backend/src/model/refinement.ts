export interface RefinementInfoPerSession {
  phase: RefinementPhase;
  userInfo: RefinementUserInfo[];
}

export interface RefinementUserInfo {
  userid: number;
  vote: string;
}

export enum RefinementPhase {
  Voting = 'voting',
  ShowResults = 'showResults'
}
