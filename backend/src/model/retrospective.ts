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
  votes?: number;
}
export interface RetrospectiveInfoPerSession {
  retrospectiveData: RetrospectiveColumn[];
  showMoodboard: boolean;
  moodboardValues?: number[];
}
