import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RetrospectiveColumnData, RetrospectiveNote } from '../../model/retrospective-data';
import { SessionService } from '../../service/session.service';

@Component({
  selector: 'app-retrospective-column',
  templateUrl: './retrospective-column.component.html',
  styleUrls: ['./retrospective-column.component.css']
})
export class RetrospectiveColumnComponent implements OnInit {

  @Input() columnData: RetrospectiveColumnData;
  @Output() newNoteEvent = new EventEmitter<number>();
  @Output() updateNoteEvent = new EventEmitter<RetrospectiveNote>();

  constructor(private sessionService: SessionService) { }
  ngOnInit(): void {
    this.columnData.notes = this.columnData.notes;
  }
  addMessage(): void {
    this.newNoteEvent.emit();
  }
  updateRetroNote(note: RetrospectiveNote): void {
    this.updateNoteEvent.emit(note);
  }
}