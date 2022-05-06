import { Message } from 'primeng/api';
import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export class MessageServiceMock {
    add(message: Message): void {
      console.log('MessageServiceMock.add()')
    }
    addAll(messages: Message[]): void {
      console.log('MessageServiceMock.addAll()')
    }
    clear(key?: string): void {
      console.log('MessageServiceMock.clear()')
    }
}
