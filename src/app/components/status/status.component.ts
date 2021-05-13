import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusService } from 'src/app/service/status.service';
import {  } from '../../service/session.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  public status: Observable<string>;

  constructor(statusService: StatusService) {
    this.status = statusService.$status;
  }

  ngOnInit(): void {
  }

}
