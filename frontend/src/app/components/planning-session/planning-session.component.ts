import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {MessageService} from 'primeng/api';
import { WsMessage } from 'src/app/model/message';

import {SessionService} from '../../service/session.service';
import {WebsocketService} from '../../service/websocket.service';

import { environment } from '../../../environments/environment';
import { User, UserVotes, SessionType, Session, Role } from '../../model/session';

import { BehaviorSubject, Subject } from 'rxjs';
import { TabSelected } from '../../shared/tab-selected';

import { ScrumCookieServiceService } from '../../service/scrum-cookie-service.service';

@Component({
    selector: 'app-planning-session',
    templateUrl: './planning-session.component.html',
    styleUrls: ['./planning-session.component.css'],
    providers: []
})
export class PlanningSessionComponent implements OnInit {

  @Output() tabSelectedEvent = new EventEmitter<TabSelected>();

  public newMessage: Subject<string> = new BehaviorSubject<string>('Status...');

  public session: Session =
    {id: null, type: SessionType.UNKNOWN, user: {id: null, name: null, role: null, vote: null}, phase: null,  users: []};
  public inSession = false;

  public messages  = 'Default message';
  public status = '';

  public switchPhase: string;
  public phase: string;

  private baseUrl: string;

  public cardNumbers = environment.CARD_SYMBOLS;
  public chartColors = environment.CHART_COLORS;

  private actions: string[] = ['UpdatePlanSession', 'NewMessage', 'UpdateVotes', 'UpdatePhase'];

  constructor(
    private sessionService: SessionService,
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private cookieService: ScrumCookieServiceService,
    private messageService: MessageService)
  {
    this.baseUrl = document.location.href;
    if (this.baseUrl.indexOf('?') >= 0) {
      this.baseUrl = this.baseUrl.substring(0, this.baseUrl.indexOf('?'));
    }
  }

  ngOnInit(): void {
    this.session.user.name = this.cookieService.getUsername();
    this.tabSelectedEvent.emit(TabSelected.PlanningPoker);
    this.route.queryParams.subscribe(params => {
      this.session.id = params.sessionId;
      if (params.userId) {
        this.session.user.name = params.userId;
      }
      if (this.session.id) {
        if (this.session.user.name) {
          this.joinSession();
        }
      }
    });
  }

  public joinSession(): void {
    this.cookieService.usingUsername(this.session.user.name);
    this.sessionService.joinSession(SessionType.REFINEMENT, this.session.id, this.session.user.name).subscribe(session => {
      if (session) {
        this.status = '';
        this.messages = 'In session\n';
        this.inSession = true;
        this.session = JSON.parse(JSON.stringify(session));
        this.websocketService.init(this.processMessage, this.session.id, this.actions, document.location.href);
        this.websocketService.send({ action: 'JoinSession', sessionId: this.session.id, userId: this.session.user.id, payload: `Joining session ${this.session.id}`});
      } else {
        this.inSession = false;
        console.log('Unable to join that session!!');
        this.status = 'Unable to join that session!';
      }
    },
    err => {
      console.log(err);
      this.status = 'Unable to join that session!';
    });
  }
  public createSession(): void {
    this.cookieService.usingUsername(this.session.user.name);
    this.sessionService.sessionCreate(this.session.user.name, SessionType.REFINEMENT).subscribe(
      session => {
        this.status = '';
        this.inSession = true;
        this.session = JSON.parse(JSON.stringify(session));
        const handler = (this.processMessage).bind(this);
        this.websocketService.init(handler, this.session.id, this.actions, document.location.href);
        this.websocketService.send({ action: 'JoinSession', sessionId: this.session.id, userId: this.session.user.id, payload: `Joining session ${this.session.id}`});
      },
      err => {
        console.log(err);
        this.status = 'Unable to create a session!';
      }
    );
  }

  public switchPhaseHandler(): void {
    if (this.phase === 'voting') {
      this.switchToPhase('showResults');
      this.websocketService.send({ action: 'SwitchPhase', sessionId: this.session.id, userId: this.session.user.id, payload: this.phase});
    } else if (this.phase === 'showResults') {
      this.switchToPhase('voting');
      this.websocketService.send({ action: 'SwitchPhase', sessionId: this.session.id, userId: this.session.user.id, payload: this.phase});
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

  public addMessage($event): void {
    const wsMessage = { action: 'AddMessage', sessionId: this.session.id, userId: this.session.user.id, payload: $event } as WsMessage;
    console.log(`PlanningSessionManager.addMessage: ${JSON.stringify(wsMessage)}`);
    this.websocketService.send(wsMessage);
  }

  public cardSelected($event): void {
    this.websocketService.send({ action: 'EnterVote',
      sessionId: this.session.id, userId: this.session.user.id, payload: $event });
  }
  public showThatTheUserHasVoted(user: User): boolean {
    return user.vote && this.phase === 'voting';
  }

  processMessage = (message: WsMessage) => {
    switch (message.action) {
      case 'UpdatePlanSession' : this.processUpdateSession(message); break;
      case 'NewMessage' : this.addNewMessage(message); break;
      case 'UpdateVotes' : this.updateVotes(message); break;
      case 'UpdatePhase' : this.updatePhase(message); break;
      default: console.log(`PlanningSessionComponent.processMessage: Unknown message action (${message.action}) received.`);
    }
  }
  private processUpdateSession(message: WsMessage): void {
    this.session.users = this.getUsersFromMessage(message);
    if (! this.session.user.role) {
      this.session.user.role = this.session.users.find(u => u.id === this.session.user.id).role;
    }
  }
  private getUsersFromMessage(message: WsMessage): User[] {
    return  (message.payload as User[]).sort((u1, u2) => {
      if (u1.name > u2.name) { return 1; }
      if (u1.name < u2.name) { return -1; }
      return 0;
    });
  }
  private addNewMessage(message: WsMessage): void {
    this.newMessage.next(message.payload);
  }
  private updateVotes(message: WsMessage): void {
    this.session.users.forEach( u => {
      const tempVote = (message.payload as UserVotes[]).find(uv => u.id === uv.userid);
      if ( tempVote) {
        u.vote = tempVote.vote;
      } else {
        u.vote = undefined;
      }
    });
  }
  private updatePhase(message: WsMessage): void {
    this.switchToPhase(message.payload);
  }
  getLinkUrl(): void {
    const result = `${this.baseUrl}?sessionId=${this.session.id}`;
    this.clipboard.copy(result);
    this.messageService.add({severity: 'success', summary: 'Success', detail: 'Url copied to clipboard'});
  }

  public isAdmin(): boolean {
    return this.session.user.role === Role.ScrumMaster;
  }
}
