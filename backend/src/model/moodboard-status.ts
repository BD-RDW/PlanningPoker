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
