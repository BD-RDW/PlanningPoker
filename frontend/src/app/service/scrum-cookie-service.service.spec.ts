import { TestBed } from '@angular/core/testing';

import { ScrumCookieServiceService } from './scrum-cookie-service.service';

describe('ScrumCookieServiceService', () => {
  let service: ScrumCookieServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrumCookieServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
