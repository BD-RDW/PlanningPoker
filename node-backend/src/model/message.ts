import { Session } from '../session';

export interface WsMessage {
  action: string;
  sessionId: string;
  userId: number;
  payload?: any;
}

export interface RetrospectiveColumnData {
  title: string;
  column: number;
  messages: RetrospectiveMessage[];
}

export interface RetrospectiveMessage {
  id: number;
  col: number;
  txt: string;
  edit: boolean;
  userId?: number;
  beingEditted?: boolean;
}
