import { RefinementInfoPerSession } from './refinement';
import { RetrospectiveInfoPerSession } from './retrospective';
import * as WebSocket from 'ws';

export interface Session {
  id: string;
  type: string;
  sessionTypeData?: RefinementInfoPerSession | RetrospectiveInfoPerSession;
  users: User[];

}

export interface User {
  id: number;
  name: string;
  role: Role;
  conn?: WebSocket;
}

export enum Role {
  Unknown = 'Unknown',
  ScrumMaster = 'ScrumMaster',
  TeamMember = 'TeamMember'
}

export enum SessionType {
  UNKNOWN = 'UNKNOWN',
  RETROSPECTIVE = 'RETROSPECTIVE',
  REFINEMENT = 'REFINEMENT'
}
