import { Session } from './session';

export interface Message {
  type: string;
  action: string;
  sessionId: string;
  userId: number;
  payload?: string;
  session?: Session;
}
