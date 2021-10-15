import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusService } from 'src/app/service/status.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  public status: Observable<string>;
  versionNumber: string = environment.appVersion;

  constructor(statusService: StatusService) {
    this.status = statusService.$status;
  }

  ngOnInit(): void {
  }

}
