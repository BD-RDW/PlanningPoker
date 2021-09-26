import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ScrumCookieServiceService {
  private usernameCookie = 'scrumUser';

  private username: string;

  constructor(private cookieService: CookieService) {
    this.username = this.cookieService.get(this.usernameCookie);
  }

  getUsername(): string {
    return this.username;
  }

  usingUsername(usernameNow: string): void {
    if (usernameNow !== this.username) {
      this.username = usernameNow;
      console.log(`Username set to ${this.username}`);
      this.cookieService.set(this.usernameCookie, this.username, 365);
    }
  }

}
