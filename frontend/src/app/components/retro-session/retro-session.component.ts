import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {MessageService} from 'primeng/api';
import { saveAs } from '../../../../node_modules/file-saver';
import { faSmile, faFrown, faMeh } from '@fortawesome/free-solid-svg-icons';

import { Observable } from 'rxjs';
import * as moment from 'moment';
import { NotesToMerge } from 'src/app/model/notes-to-merge';
import { RetroSessionService } from 'src/app/service/retro-session.service';
import { ActivatedRoute } from '@angular/router';
import { TabSelected } from '../../shared/tab-selected';
import { ScrumCookieServiceService } from '../../service/scrum-cookie-service.service';
import { RetrospectiveNote } from '../../model/retrospective-data';
import { MenuItem } from 'primeng/api';
import { SessionConnectType, SessionInfo } from 'src/app/model/session-info';

@Component({
  selector: 'app-retro-session',
  templateUrl: './retro-session.component.html',
  styleUrls: ['./retro-session.component.css']
})
export class RetroSessionComponent implements OnInit {

  @Output() tabSelectedEvent = new EventEmitter<TabSelected>();
  public newMessage: Observable<string> = this.retroService.newMessage;

  public menuItems: MenuItem[] = [
    {label: 'export', command: () => { this.saveNotes(); }},
  ];

  public icons = [faSmile, faMeh, faFrown];

  public messages = 'Default message';
  public message = '';
  public status = '';

  public display = false;

  private baseUrl: string;

  constructor(public retroService: RetroSessionService,
              private route: ActivatedRoute,
              private clipboard: Clipboard,
              private cookieService: ScrumCookieServiceService,
              private messageService: MessageService) {

    this.retroService.session.user.name = this.cookieService.getUsername();
    this.baseUrl = document.location.href;
    if (this.baseUrl.indexOf('?') >= 0) {
      this.baseUrl = this.baseUrl.substring(0, this.baseUrl.indexOf('?'));
    }
  }

  ngOnInit(): void {
    if (! this.retroService.inSession) {
      this.tabSelectedEvent.emit(TabSelected.Retrospective);
      this.route.queryParams.subscribe(params => {
        this.retroService.session.id = params.sessionId;
        if (params.userId) {
          this.retroService.session.user.name = params.userId;
        }
        if (this.retroService.session.id) {
          if (this.retroService.session.user.name) {
            this.joinSession({username: this.retroService.session.user.name, sessionId: this.retroService.session.id} as SessionInfo);
          } else {
            
          }
        }
      });
    }
  }

  public joinSession(sessionInfo: SessionInfo): void {
    this.cookieService.usingUsername(sessionInfo.username);
    this.retroService.joinSession(sessionInfo).subscribe(r => {
      if (!this.retroService.inSession) {
        console.log('Unable to join that session!!');
        this.status = 'Unable to join that session';
      } else {
        if (this.retroService.isAdmin()) {
         this.menuItems.push ({label: 'moodboard', command: () => { alert('Show moodboard'); }});
        }
      }
    });
  }
  public createSession(sessionInfo: SessionInfo): void {
    this.cookieService.usingUsername(sessionInfo.username);
    this.retroService.createSession(sessionInfo).subscribe(r => {
      if (! r) {
        console.log('Unable to create session!!');
        this.status = 'Unable to create session';
      } else {
        if (this.retroService.isAdmin()) {
         this.menuItems.push ({label: 'moodboard', command: () => { this.moodboardStatusUpdate(); }});
        }
      }
    });
  }

  public openSession($event: SessionInfo): void {
    switch ($event.state) {
      case SessionConnectType.NEW : this.createSession($event); break;
      case SessionConnectType.EXISTING : this.joinSession($event); break;
    }
  }

  public addMessage($event): void {
    this.retroService.addMessage($event);
  }

  public voted($event): void {
    this.retroService.voted($event);
  }
  addNote(colId: number): void {
    this.retroService.addNote(colId);
  }
  sendUpdatedNote(note: RetrospectiveNote): void {
    this.retroService.sendUpdatedNote(note);
  }
  sendEditNote(note: RetrospectiveNote): void {
    this.retroService.sendEditNote(note);
  }
  sendDeleteNote(note: RetrospectiveNote): void {
    this.retroService.sendDeleteNote(note);
  }
  public mergeNotes(notes2Merge: NotesToMerge): void {
    console.log(`Merging note ${notes2Merge.note2MergeId} into note ${notes2Merge.baseNoteId}`);
    console.log(JSON.stringify(notes2Merge));
    this.retroService.mergeNotes(notes2Merge);
  }
  getLinkUrl(): void {
    const result = `${this.baseUrl}?sessionId=${this.retroService.session.id}`;
    this.clipboard.copy(result);
    this.messageService.add({severity: 'success', summary: 'Success', detail: 'Url copied to clipboard'});
  }
  public saveNotes(): void {
    const nodeTexts: string[] = this.retroService.columnData.map(cd => cd.title + '\n' + cd.notes.map(n => '\t' + n.txt + '\n') + '\n\n');
    const blob = new Blob(nodeTexts, {type: 'text/plain;charset=utf-8'});
    const filename = 'RetrospectiveNotes_' + moment(Date.now()).format('YYYYMMDD_HHmmss') + '.txt';
    saveAs(blob, filename);
  }
  public myMoodSelection(selection: number): void {
    this.retroService.myMoodSelection(selection);
  }
  public moodboardStatusUpdate(): void {
    this.retroService.moodboardStatusUpdate(this.icons.length);
  }
}
