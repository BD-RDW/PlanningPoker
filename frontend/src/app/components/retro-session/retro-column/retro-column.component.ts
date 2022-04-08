import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RetrospectiveColumnData, RetrospectiveNote } from '../../../model/retrospective-data';
import { SessionService } from '../../../service/session.service';
import { NotesToMerge } from '../../../model/notes-to-merge';

@Component({
  selector: 'app-retro-column',
  templateUrl: './retro-column.component.html',
  styleUrls: ['./retro-column.component.css']
})
export class RetroColumnComponent implements OnInit {

  @Input() userId: number;
  @Input() columnData: RetrospectiveColumnData;
  @Input() @Output() availableVotes: number;
  @Output() newNoteEvent = new EventEmitter<number>();
  @Output() updateNoteEvent = new EventEmitter<RetrospectiveNote>();
  @Output() editNoteEvent = new EventEmitter<RetrospectiveNote>();
  @Output() deleteNoteEvent = new EventEmitter<RetrospectiveNote>();
  @Output() votedEvent = new EventEmitter<RetrospectiveNote>();
  @Output() mergeNotesEvent = new EventEmitter<NotesToMerge>();

  constructor(private sessionService: SessionService) { }
  ngOnInit(): void {
    // this.columnData.notes = this.columnData.notes;
  }
  addMessage(): void {
    this.newNoteEvent.emit();
  }
  updateRetroNote(note: RetrospectiveNote): void {
    this.updateNoteEvent.emit(note);
  }
  public editRetroNote(note: RetrospectiveNote): void {
    this.editNoteEvent.emit(note);
  }
  public deleteRetroNote(note: RetrospectiveNote): void {
    this.deleteNoteEvent.emit(note);
  }
  public voted($event): void {
    this.votedEvent.emit($event);
  }
  public mergeNotes(notes2Merge: NotesToMerge): void {
    this.mergeNotesEvent.emit(notes2Merge);
  }

}
