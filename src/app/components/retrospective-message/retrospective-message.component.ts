import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Session } from 'src/app/model/session';
import { RetrospectiveNote } from '../../model/retrospective-data';

@Component({
  selector: 'app-retrospective-message',
  templateUrl: './retrospective-message.component.html',
  styleUrls: ['./retrospective-message.component.css']
})
export class RetrospectiveMessageComponent implements OnInit {

  public tempMessage: string;

  @Input() message: RetrospectiveNote;
  @Input() userId: number;
  @Input() availableVotes: number;
  @Output() updateNote = new EventEmitter<RetrospectiveNote>();
  @Output() editNote = new EventEmitter<RetrospectiveNote>();
  @Output() deleteNote = new EventEmitter<RetrospectiveNote>();
  @Output() votedEvent = new EventEmitter<RetrospectiveNote>();

  constructor() { }


  ngOnInit(): void {
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
    return (this.message.userId && this.userId === this.message.userId);
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
    console.log(`availableVotes: ${this.availableVotes}`);
    return this.availableVotes < 1;
  }
}
