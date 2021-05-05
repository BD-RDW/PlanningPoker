import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { Message } from 'src/app/model/message';

import { SessionService } from '../../service/session.service';
import { WebsocketService } from '../../service/websocket.service';

import { environment } from '../../../environments/environment';

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
  public users: UserInfo[] = [];

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
    this.phase = 'showResults';
    this.switchPhaseHandler();
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
        this.websocketService.send({ type: 'Session', action: 'join', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}`});
      } else {
        this.inSession = false;
        console.log('Unable to join that session!!');
      }
    });
  }
  public createSession(): void {
    console.log(`Create new session for ${this.username}`);
    this.sessionService.sessionCreate(this.username).subscribe(
      session => {
        this.inSession = true;
        this.sessionId = session.sessionId;
        this.userId = session.userId;
        this.username = session.username;
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler);
        this.websocketService.send({ type: 'SESSION', action: 'JOIN', sessionId: this.sessionId, userId: this.userId, payload: `Joining session ${this.sessionId}`});
      },
      err => console.log(err)
    );
  }

  public switchPhaseHandler(): void {
    if (this.phase === 'voting') {
      this.phase = 'showResults';
      this.switchPhase = 'Start voting';
      this.websocketService.send({ type: 'SESSION', action: 'PHASE', sessionId: this.sessionId, userId: this.userId, payload: this.phase});
    } else if (this.phase === 'showResults') {
      this.phase = 'voting';
      this.switchPhase = 'Finish voting';
      this.websocketService.send({ type: 'SESSION', action: 'PHASE', sessionId: this.sessionId, userId: this.userId, payload: this.phase});
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
    this.websocketService.send({ type: 'SESSION', action: 'MESSAGE',
      sessionId: this.sessionId, userId: this.userId, payload: this.message });
  }

  public cardSelected($event): void {
    console.log('%O', $event);
    this.websocketService.send({ type: 'SESSION', action: 'VOTE',
      sessionId: this.sessionId, userId: this.userId, payload: $event });
  }
  public showThatTheUserHasVoted(user: UserInfo): boolean {
    return user.vote && this.phase === 'voting';
  }


  processMessage = (message: Message) => {
    switch (message.type.toUpperCase()) {
      case 'CONNECTION' : this.processConnectionMessage(message); break;
      case 'SESSION' : this.processSessionMessage(message); break;
      case 'ERROR' : this.processErrorMessage(message); break;
      default: console.log(`Unknown message type (${message.type} received.)`);
    }
  }
  processSessionMessage(message: Message): void {
    switch (message.action.toUpperCase()) {
      case 'MESSAGE' : { this.messages = `${message.payload}\n${this.messages}`; break; }
      case 'PHASE' : { this.switchToPhase(message.session.phase); this.users = this.getUsersFromMessage(message); break; }
      case 'UPDATE' : {
        this.users = this.getUsersFromMessage(message);
        if (! this.myRole) {
          this.myRole = message.session.users.find(u => u.id === this.userId).role;
        }
        if (message.session.phase && this.phase !== message.session.phase) {
          this.switchToPhase(message.session.phase);
        }
        break;
      }
      default: console.log(`Unknown Session action ${message.action}`);
    }
  }
  processConnectionMessage(message: Message): void {
    switch (message.action.toUpperCase()) {
      case 'INIT' : { this.status = `Websocket connection established`; break; }
      default: console.log(`Unknown Connection action ${message.action}`);
    }
  }
  processErrorMessage(message: Message): void {
    switch (message.action.toUpperCase()) {
      case 'ERROR' : { this.messages = `Websocket connection established`; break; }
      default: console.log(`Unknown Error action ${message.action}`);
    }
  }
  private getUsersFromMessage(message: Message): UserInfo[] {
    return message.session.users.map(u => ({name: u.username, vote: u.vote })).sort((u1, u2) => {
      if (u1.name > u2.name) { return 1; }
      if (u1.name < u2.name) { return -1; }
      return 0;
    });
  }
}

interface UserInfo {
  name: string;
  vote: string;
}