import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

import { WsMessage } from '../../model/message';
import { RetrospectiveColumnData, RetrospectiveNote } from '../../model/retrospective-data';
import { User, SessionType } from '../../model/session';
import { saveAs } from '../../../../node_modules/file-saver';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as moment from 'moment';
import { NotesToMerge } from 'src/app/model/notes-to-merge';
import { RetroSessionService } from 'src/app/service/retro-session.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TabSelected } from '../../shared/tab-selected';

@Component({
  selector: 'app-retro-session',
  templateUrl: './retro-session.component.html',
  styleUrls: ['./retro-session.component.css']
})
export class RetroSessionComponent implements OnInit {

  @Output() tabSelectedEvent = new EventEmitter<TabSelected>();
  public newMessage: Observable<string> = this.retroService.newMessage;


  public messages = 'Default message';
  public message = '';
  public status = '';

  public display = false;

  private baseUrl: string;

  constructor(public retroService: RetroSessionService,
              private route: ActivatedRoute,
              private clipboard: Clipboard) {
    this.baseUrl = document.location.href;
    if (this.baseUrl.indexOf('?') >= 0) {
      this.baseUrl = this.baseUrl.substring(0, this.baseUrl.indexOf('?'));
    }
  }

  ngOnInit(): void {
    this.tabSelectedEvent.emit(TabSelected.Retrospective);
    this.route.queryParams.subscribe(params => {
      this.retroService.session.id = params.sessionId;
      this.retroService.session.user.name = params.userId;
      if (this.retroService.session.id) {
        if (this.retroService.session.user.name) {
          this.joinSession();
        }
      }
    });
  }

  public joinSession(): void {
    this.retroService.joinSession().subscribe(r => {
      if (!this.retroService.inSession) {
        console.log('Unable to join that session!!');
        this.status = 'Unable to join that session';
      }
    });
  }
  public createSession(): void {
    this.retroService.createSession().subscribe(r => {
      if (! r) {
        console.log('Unable to create session!!');
        this.status = 'Unable to create session';
      }
    });
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
    const result = `${this.baseUrl}?sessionId=${this.retroService.session.id}&userId=`;
    this.clipboard.copy(result);
  }
  public auxilaryMenu(): void {
    const nodeTexts: string[] = this.retroService.columnData.map(cd => cd.title + '\n' + cd.notes.map(n => '\t' + n.txt + '\n') + '\n\n');
    const blob = new Blob(nodeTexts, {type: 'text/plain;charset=utf-8'});
    const filename = 'RetrospectiveNotes_' + moment(Date.now()).format('YYYYMMDD_HHmmss') + '.txt';
    saveAs(blob, filename);
  }
}
