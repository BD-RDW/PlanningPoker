import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-refinement-message',
  templateUrl: './refinement-message.component.html',
  styleUrls: ['./refinement-message.component.css']
})
export class RefinementMessageComponent implements OnInit {

  @Input() message: string;
  constructor() { }

  ngOnInit(): void {
  }

}
