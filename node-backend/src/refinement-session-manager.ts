import { AbstractManager } from './abstract-manager';
import { WsMessage } from './model/message';
import { Session, SessionMgr } from './session';
import * as WebSocket from 'ws';
import { RefinementInfoPerSession } from './model/refinement';

export class RefinementSessionMgr extends AbstractManager {
  // JoinSession       (Session)       -> User get added to the szession
  // UpdatePlanSession (Session)       <- Server updates userlist ==> Join
  // AddMessage        (Session)       -> Usermessage received
  // NewMessage        (Session)       <- Server distributes message
  // EnterVote         (Refinement)    -> User enters vote
  // UpdateVotes       (Refinement)    <- Server updates user votes ==> Vote
  // SwitchPhase       (Refinement)    -> Scrummaster switches phase
  // UpdatePhase       (Refinement)    <- Server updates phase

  refinementInfo: RefinementInfoPerSession[] = [];

  constructor(private sessionMgr: SessionMgr) {
      super();
  }
  getSessionMgr(): SessionMgr {
      return this.sessionMgr;
  }
  public processWsMessage(message: WsMessage, ws: WebSocket): void {
      switch (message.action) {
          case 'JoinSession': this.processJoinSession(message, ws); break;
          case 'AddMessage': this.processAddMessage(message); break;
          case 'EnterVote': this.processEnterVote(message); break;
          case 'SwitchPhase': this.processSwitchPhase(message); break;
          default: {
              const wsMessage: WsMessage = {action: 'ERROR', payload: `Unable to process message action ${message.action}`
              , sessionId: message.sessionId, userId: message.userId };
              ws.send(wsMessage);
              console.log('RetrospectiveSessionMgr: ERROR; Unable to proces message action: %s', message.action);
          }
      }
  }
  private processJoinSession(message: WsMessage, ws: WebSocket): void {
      this.addUserToSession(message, ws);
      this.updatePhaseForUser(message);
      this.updateVotesForUser(message);
  }
  private processAddMessage(message: WsMessage): void {
      this.processMessage(message);
  }
  private updatePhaseForUser(message: WsMessage): void {
      const session = this.sessionMgr.findSessionForUser(message.userId);
      let refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
      if ( ! refinementInfo ) {
          refinementInfo = { sessionId: message.sessionId, phase: 'voting', userInfo: [] };
          this.refinementInfo.push(refinementInfo);
      }
      // tslint:disable-next-line:max-line-length
      const wsMessage: WsMessage = {action: 'UpdatePhase', sessionId: message.sessionId, userId: message.userId, payload: refinementInfo.phase};
      session.users.find(u => u.id === message.userId).conn.send(JSON.stringify(wsMessage, this.skipFields));
  }
  private updateVotesForUser(message: WsMessage): void {
      const refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
      const session = this.sessionMgr.findSessionForUser(message.userId);
      // tslint:disable-next-line:max-line-length
      const wsMessage: WsMessage = {action: 'UpdateVotes', sessionId: session.id, userId: message.userId, payload: refinementInfo.userInfo };
      session.users.find(u =>  u.id === message.userId).conn.send(JSON.stringify(wsMessage, this.skipFields));
  }
  // EnterVote     (Refinement)    -> User enters vote
  // UpdateVotes   (Refinement)    <- Server updates user votes ==> Vote
  private processEnterVote(message: WsMessage): void {
      const vote = message.payload;
      const refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
      let userInfo = refinementInfo.userInfo.find(u => u.userid === message.userId);
      if (! userInfo) {
          userInfo = { userid: message.userId, vote: message.payload };
          refinementInfo.userInfo.push(userInfo);
      }
      else { userInfo.vote = vote; }
      const session = this.sessionMgr.findSessionForUser(message.userId);
      session.users.forEach(u => {
          const wsMessage: WsMessage = {action: 'UpdateVotes', sessionId: session.id, userId: u.id, payload: refinementInfo.userInfo };
          if (u.conn) { u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
  }
  // SwitchPhase   (Refinement)    -> Scrummaster switches phase
  // UpdatePhase   (Refinement)    <- Server updates phase
  private processSwitchPhase(message: WsMessage): void {
      const phase = message.payload;
      const refinementInfo = this.refinementInfo.find(ri => ri.sessionId === message.sessionId);
      refinementInfo.phase = phase;
      const session = this.sessionMgr.findSessionForUser(message.userId);
      session.users.forEach(u => {
          const wsMessage: WsMessage = {action: 'UpdatePhase', sessionId: session.id, userId: u.id, payload: refinementInfo.phase };
          if (u.conn) { u.conn.send(JSON.stringify(wsMessage, this.skipFields));
          }
      });
      if (refinementInfo.phase === 'voting') {
          refinementInfo.userInfo = [];
          session.users.forEach(u => {
              const wsMessage = {action: 'UpdateVotes', sessionId: session.id, userId: u.id, payload: refinementInfo.userInfo };
              if (u.conn) { u.conn.send(JSON.stringify(wsMessage, this.skipFields));
              }
          });
      }
  }
}
