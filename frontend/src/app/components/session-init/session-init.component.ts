import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SessionInfo, SessionConnectType } from '../../model/session-info';
import { MessageService } from 'primeng/api';

import { ScrumCookieServiceService } from '../../service/scrum-cookie-service.service';

@Component({
  selector: 'app-session-init',
  templateUrl: './session-init.component.html',
  styleUrls: ['./session-init.component.css']
})
export class SessionInitComponent implements OnInit {

  @Output() onStartSession = new EventEmitter<SessionInfo>();
  @Input()  sessionId: string;
  
  sessionInfo: SessionInfo;
  sessionConnectType = [SessionConnectType.NEW, SessionConnectType.EXISTING];

  constructor(
    private cookieService: ScrumCookieServiceService,
    private messageService: MessageService
    ) { }

  ngOnInit(): void {
    this.sessionInfo = {username: this.cookieService.getUsername(), sessionId: this.sessionId, state: SessionConnectType.NEW}
    if (this.sessionId) {
      this.sessionInfo.state = SessionConnectType.EXISTING
    }
  }

  public openSession(): void {
    console.log(`SessionInfo: ${JSON.stringify(this.sessionInfo)}`)
    if (!this.sessionInfo.username || this.sessionInfo.username.trim().length == 0) {
      this.messageService.add({severity:'error', summary:'Username is empty', detail:'Username has to be entered'});
    }
    else if (this.sessionInfo.state === SessionConnectType.EXISTING && (!this.sessionInfo.sessionId || this.sessionInfo.sessionId.trim().length == 0)) {
      this.messageService.add({severity:'error', summary:'SessionId is empty', detail:'A valid sessionId has to be entered when joining an existing session'});
      return;
    } else {
      this.onStartSession.emit(this.sessionInfo);
    }
  }

}
