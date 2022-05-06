import { TestBed } from '@angular/core/testing';

import { ScrumCookieService } from './scrum-cookie.service';

describe('ScrumCookieServiceService', () => {
  let service: ScrumCookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrumCookieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
