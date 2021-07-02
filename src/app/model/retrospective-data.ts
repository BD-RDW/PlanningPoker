export interface RetrospectiveColumnData {
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
