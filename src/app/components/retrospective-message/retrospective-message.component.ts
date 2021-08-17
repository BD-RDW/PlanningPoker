import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ɵ_sanitizeHtml } from '@angular/core';
import { RetrospectiveNote } from '../../model/retrospective-data';
import { NotesToMerge } from '../../model/notes-to-merge';
import * as sanitizeHtml from 'sanitize-html';

@Component({
  selector: 'app-retrospective-message',
  templateUrl: './retrospective-message.component.html',
  styleUrls: ['./retrospective-message.component.css']
})
export class RetrospectiveMessageComponent implements OnInit, AfterViewInit {
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

  constructor() { }


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
      $event.dataTransfer.setData('number', this.message.id);
    }
    return this.messageIsNotBeingEditted();
  }
  public allowDrop($event: any): void {
    if (this.messageIsNotBeingEditted() && this.message.id !== parseInt($event.dataTransfer.getData('number'), 10)) {
      $event.preventDefault();
    }
  }
  public onDrop($event: any): void {
    $event.preventDefault();
    this.mergeNotesEvent.emit({baseNoteId: this.message.id,
      note2MergeId: parseInt($event.dataTransfer.getData('number'), 10)} as NotesToMerge);
  }

  public getMessageTxt(): string {
    let txt = sanitizeHtml(this.message.txt);
    while (txt.indexOf('\n') > 0) {
      txt = txt.replace('\n', '<BR>');
    }
    return txt;
  }
}
