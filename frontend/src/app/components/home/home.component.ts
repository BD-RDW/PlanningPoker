import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TabSelected } from '../../shared/tab-selected';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @Output() tabSelectedEvent = new EventEmitter<TabSelected>();

  constructor() { }

  ngOnInit(): void {
    this.tabSelectedEvent.emit(TabSelected.Home);
  }

}
