import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ɵ_sanitizeHtml } from '@angular/core';
import { RetrospectiveNote } from '../../../model/retrospective-data';
import { NotesToMerge } from '../../../model/notes-to-merge';
import * as sanitizeHtml from 'sanitize-html';
import { RetroSessionService } from 'src/app/service/retro-session.service';

@Component({
  selector: 'app-retro-message',
  templateUrl: './retro-message.component.html',
  styleUrls: ['./retro-message.component.css']
})
export class RetroMessageComponent implements OnInit, AfterViewInit {
  @ViewChild('noteTextarea') textElement: ElementRef;

  public tempMessage: string;

  @Input() message: RetrospectiveNote;
  @Input() userId: number;
  @Input() availableVotes: number;
  @Output() updateNote = new EventEmitter<RetrospectiveNote>();
  @Output() editNote = new EventEmitter<RetrospectiveNote>();
  @Output() deleteNote = new EventEmitter<RetrospectiveNote>();
  @Output() votedEvent = new EventEmitter<RetrospectiveNote>();
  @Output() mergeNotesEvent = new EventEmitter<NotesToMerge>();

  constructor(public retroService: RetroSessionService) { }


  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    if (this.textElement && this.messageIsBeingEdittedByMe) {
       this.textElement.nativeElement.focus();
    }
  }
  processText(event): void {
    if (event.key === 'Enter') {
      this.message.userId = null;
      this.message.txt = event.target.value;
      this.updateNote.emit(this.message);
    }
  }
  public messageIsNotBeingEditted(): boolean {
    return ( !this.message.userId );
  }
  public messageIsBeingEdittedButNotByMe(): boolean {
    return (this.message.userId && this.message.userId !== this.userId);
  }
  public messageIsBeingEdittedByMe(): boolean {
    return this.message.userId && this.userId === this.message.userId;
  }
  public editMessage(): void {
    this.editNote.emit(this.message);
  }
  public deleteMessage(): void {
    this.deleteNote.emit(this.message);
  }
  public voteMessage(): void {
    if (this.availableVotes < 1) { return; }
    if (this.message.votes) {
      this.message.votes++;
    } else {
      this.message.votes = 1;
    }
    this.votedEvent.emit(this.message);
  }
  public stillHaveVotes(): boolean {
    return this.availableVotes < 1;
  }

  public dragStart($event: any): boolean {
    if (this.messageIsNotBeingEditted()) {
      this.retroService.setDraggedMessage(this.message);
    }
    return this.messageIsNotBeingEditted();
  }
  public allowDrop($event: any): void {
    console.log('allowDrop: ' + JSON.stringify($event));
    if (this.messageIsNotBeingEditted() && this.message.id !== this.retroService.getDraggedMessageId()) {
      $event.preventDefault();
    }
  }
  public onDrop($event: any): void {
    $event.preventDefault();
    const note2MergeId = this.retroService.getDraggedMessageId();
    this.retroService.resetDraggedMessage();
    this.mergeNotesEvent.emit({baseNoteId: this.message.id, note2MergeId } as NotesToMerge);
  }

  public getMessageTxt(): string {
    let txt = sanitizeHtml(this.message.txt);
    while (txt.indexOf('\n') > 0) {
      txt = txt.replace('\n', '<BR>');
    }
    return txt
    ;
  }
  public getMessageTxtOrPlaceholder(): string {
    return this.message.txt ? this.message.txt : 'Being edited...';
  }
}
