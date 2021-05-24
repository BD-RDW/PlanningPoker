import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RetrospectiveNote } from '../../model/retrospective-data';
import { SessionService } from '../../service/session.service';

@Component({
  selector: 'app-retrospective-message',
  templateUrl: './retrospective-message.component.html',
  styleUrls: ['./retrospective-message.component.css']
})
export class RetrospectiveMessageComponent implements OnInit {

  public tempMessage: string;

  @Input() message: RetrospectiveNote;
  @Output() updateNote = new EventEmitter<RetrospectiveNote>();

  constructor(private sessionService: SessionService) { }

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
    if (this.message.userId && this.sessionService.getSession().userId === this.message.userId)
    {
      return true;
    }
    return false;
  }
}
