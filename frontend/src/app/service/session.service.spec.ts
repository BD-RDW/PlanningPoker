import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SessionService } from './session.service';
import { Type } from '@angular/core';

describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
