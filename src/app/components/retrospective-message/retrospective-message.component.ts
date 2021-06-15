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
  @Output() updateNote = new EventEmitter<RetrospectiveNote>();

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

  public messageIsBeingEdittedByMe(): boolean {
    if (this.message.userId && this.userId === this.message.userId)
    {
      return true;
    }
    return false;
  }
}
