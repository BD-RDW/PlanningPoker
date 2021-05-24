import { Session } from './session';

export interface WsMessage {
  action: string;
  sessionId: string;
  userId: number;
  payload?: any;
}
