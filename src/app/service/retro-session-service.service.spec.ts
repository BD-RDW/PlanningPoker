import { TestBed } from '@angular/core/testing';

import { RetroSessionServiceService } from './retro-session-service.service';

describe('RetroSessionServiceService', () => {
  let service: RetroSessionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetroSessionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
