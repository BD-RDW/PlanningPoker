import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-refinement-column',
  templateUrl: './refinement-column.component.html',
  styleUrls: ['./refinement-column.component.css']
})
export class RefinementColumnComponent implements OnInit {

  @Input() data: any;

  constructor() { }
  ngOnInit(): void {
  }
}
