import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { ScrumCookieServiceService } from 'src/app/service/scrum-cookie-service.service';

import { SessionInitComponent } from './session-init.component';

describe('SessionInitComponent', () => {
  let component: SessionInitComponent;
  let fixture: ComponentFixture<SessionInitComponent>;

  let cookieServiceMock: ScrumCookieServiceService;
  let messageServiceMock: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionInitComponent ],
      providers: [
        ScrumCookieServiceService,
        MessageService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionInitComponent);
    cookieServiceMock = TestBed.inject(ScrumCookieServiceService);
    messageServiceMock = TestBed.inject(MessageService);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
