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
export interface MoodboardStatus {
  display: boolean;
  values: number[];
}

export interface MoodboardUpdate {
  display: boolean;
  arraySize: number;
  previousvalue?: number;
  currentValue?: number;
}
