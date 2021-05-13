import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  public $status: Subject<string> = new BehaviorSubject<string>('Status...');

  constructor() { }

  public statusMessage(message: string): void {
    this.$status.next(message);
  }
}
