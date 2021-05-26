import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { WsMessage } from 'src/app/model/message';

import { SessionService } from '../../service/session.service';
import { WebsocketService } from '../../service/websocket.service';

import { environment } from '../../../environments/environment';
import { User, UserVotes } from '../../model/Session';

@Component({
  selector: 'app-planning-session',
  templateUrl: './planning-session.component.html',
  styleUrls: ['./planning-session.component.css']
})
export class PlanningSessionComponent implements OnInit {

  public sessionId: string;
  public userId: number;
  public username = '';
  public messages  = 'Default message';
  public message = '';
  public status = '';
  public users: User[] = [];

  public switchPhase: string;
  public phase: string;
  public myRole: string;

  public inSession = false;

  public cardNumbers = environment.CARD_SYMBOLS;
  public chartColors = environment.CHART_COLORS;

  constructor(
    private sessionService: SessionService,
    private websocketService: WebsocketService)
  {
  }

  ngOnInit(): void {
    this.inSession = false;
    this.sessionId = null;
  }

  public joinSession(): void {
    this.sessionService.joinSession(this.sessionId, this.username).subscribe(session => {
      if (session) {
        this.messages = 'In session';
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        this.websocketService.init(this.processMessage);
        this.websocketService.send({ action: 'JoinSession', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}`});
      } else {
        this.inSession = false;
        console.log('Unable to join that session!!');
      }
    });
  }
  public createSession(): void {
    console.log(`Create new session for ${this.username}`);
    this.sessionService.sessionCreate(this.username, 'REFINEMENT').subscribe(
      session => {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler);
        this.websocketService.send({ action: 'JoinSession', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}`});
      },
      err => console.log(err)
    );
  }

  public switchPhaseHandler(): void {
    if (this.phase === 'voting') {
      this.switchToPhase('showResults');
      this.websocketService.send({ action: 'SwitchPhase', sessionId: this.sessionId, userId: this.userId, payload: this.phase});
    } else if (this.phase === 'showResults') {
      this.switchToPhase('voting');
      this.websocketService.send({ action: 'SwitchPhase', sessionId: this.sessionId, userId: this.userId, payload: this.phase});
    } else {
      console.log(`Unknown phase ${this.phase}`);
    }
  }

  private switchToPhase(phase: string): void {
    if (phase === 'voting') {
      this.phase = 'voting';
      this.switchPhase = 'Finish voting';
    } else if (phase === 'showResults') {
      this.phase = 'showResults';
      this.switchPhase = 'Start voting';
    } else {
      console.log(`Unknown phase ${phase}`);
    }
  }

  public addMessage(): void {
    this.websocketService.send({ action: 'AddMessage',
      sessionId: this.sessionId, userId: this.userId, payload: this.message });
  }

  public cardSelected($event): void {
    this.websocketService.send({ action: 'EnterVote',
      sessionId: this.sessionId, userId: this.userId, payload: $event });
  }
  public showThatTheUserHasVoted(user: User): boolean {
    return user.vote && this.phase === 'voting';
  }


  processMessage = (message: WsMessage) => {
    switch (message.action) {
      case 'UpdateSession' : this.processUpdateSession(message); break;
      case 'NewMessage' : this.addNewMessage(message); break;
      case 'UpdateVotes' : this.updateVotes(message); break;
      case 'UpdatePhase' : this.updatePhase(message); break;
      case 'ERROR' : this.processErrorMessage(message); break;
      case 'INIT' : { this.status = `Websocket connection established`; break; }
      default: console.log(`Unknown message action (${message.action} received.)`);
    }
  }
  processErrorMessage(message: WsMessage): void {
    console.log(`Error ${message.payload}`);
  }
  private processUpdateSession(message: WsMessage): void {
    this.users = this.getUsersFromMessage(message);
    if (! this.myRole) {
      this.myRole = this.users.find(u => u.id === this.userId).role;
    }
  }
  private getUsersFromMessage(message: WsMessage): User[] {
    return  (message.payload as User[]).sort((u1, u2) => {
      if (u1.username > u2.username) { return 1; }
      if (u1.username < u2.username) { return -1; }
      return 0;
    });
  }
  private addNewMessage(message: WsMessage): void {
    this.messages = `${message.payload}\n${this.messages}`;
  }
  private updateVotes(message: WsMessage): void {
    (message.payload as UserVotes[]).forEach(uv => {
      this.users.find(u => u.id === uv.userid).vote = uv.vote;
    });
  }
  private updatePhase(message: WsMessage): void {
    this.switchToPhase(message.payload);
  }
}