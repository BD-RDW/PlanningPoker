import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { PlanningSessionComponent } from './planning-session.component';
import { SessionService } from 'src/app/service/session.service';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from 'src/app/service/websocket.service';
import { ScrumCookieServiceService } from 'src/app/service/scrum-cookie-service.service';
import { MessageService } from 'primeng/api';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('PlanningSessionComponent', () => {
  let component: PlanningSessionComponent;
  let fixture: ComponentFixture<PlanningSessionComponent>;
  let sessionService: SessionService;
  let websocketService: WebsocketService;
  let route: ActivatedRoute;
  let clipboard: Clipboard;
  let cookieService: ScrumCookieServiceService;
  let messageService: MessageService;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
       ],
      declarations: [
        PlanningSessionComponent
      ],
      providers: [
        SessionService,
        WebsocketService,
        Clipboard,
        ScrumCookieServiceService,
        MessageService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningSessionComponent);
    component = fixture.componentInstance;
    sessionService = fixture.debugElement.injector.get<SessionService>(SessionService);
    websocketService = fixture.debugElement.injector.get<WebsocketService>(WebsocketService);
    route = fixture.debugElement.injector.get<ActivatedRoute>(ActivatedRoute);
    // clipboard = fixture.debugElement.injector.get<Clipboard>(Clipboard);
    cookieService = fixture.debugElement.injector.get<ScrumCookieServiceService>(ScrumCookieServiceService);
    messageService = fixture.debugElement.injector.get<MessageService>(MessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
