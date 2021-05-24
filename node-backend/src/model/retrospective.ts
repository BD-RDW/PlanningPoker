export interface RetrospectiveColumn {
  title: string;
  column: number;
  notes: RetrospectiveNote[];
}

export interface RetrospectiveNote {
  id: number;
  col: number;
  txt: string;
  userId?: number;
}
export interface RetrospectiveInfoPerSession {
  sessionId: string;
  retrospectiveData: RetrospectiveColumn[];
}
