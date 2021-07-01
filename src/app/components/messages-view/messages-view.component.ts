import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-messages-view',
  templateUrl: './messages-view.component.html',
  styleUrls: ['./messages-view.component.css']
})
export class MessagesViewComponent implements OnInit {

  @Input() messageReceived: Observable<string >;
  @Output() messageEntered = new EventEmitter<string>();

  public message = '';
  public messages: Message[] = [];
  private interval: any;


  constructor(){ }

  ngOnInit(): void {
    this.messageReceived.subscribe(
      data => this.messages = [ { message: data, timeEntered: Date.now()}, ...this.messages ]
    );
    this.interval = setInterval(() => this.messages = this.messages.filter(m => (Date.now() - m.timeEntered) < 90000 ), 60000);
  }

  public addMessage(): void {
    this.messageEntered.emit(this.message);
  }

}
interface Message {
  message: string;
  timeEntered: number;
}
