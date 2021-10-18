import { TestBed } from '@angular/core/testing';
import { RetroSessionService } from './retro-session.service';
import { SessionService } from './session.service';
import { WebsocketService } from './websocket.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('RetroSessionService', () => {
  let service: RetroSessionService;
  let sessionServiceMock: SessionService;
  let websocketServiceMock: WebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        WebsocketService,
        SessionService
      ]
    });
    service = TestBed.inject(RetroSessionService);
    sessionServiceMock = TestBed.inject(SessionService);
    websocketServiceMock = TestBed.inject(WebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  // Jasmine: spyOn()
  // https://codecraft.tv/courses/angular/unit-testing/angular-test-bed/
});
