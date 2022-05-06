import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export class ScrumCookieServiceMock {

  private username = 'testuser';

  setUsername(name: string) {
    console.log(`ScrumCookieServiceMock.setUsername('${name}')`);
    this.username = name;
  }

  getUsername(): string {
    console.log('ScrumCookieServiceMock.getUsername()');
    return this.username;
  }
}
