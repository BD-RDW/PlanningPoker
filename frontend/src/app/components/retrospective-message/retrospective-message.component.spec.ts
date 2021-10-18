import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetroSessionService } from 'src/app/service/retro-session.service';

import { RetrospectiveMessageComponent } from './retrospective-message.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('RetrospectiveMessageComponent', () => {
  let component: RetrospectiveMessageComponent;
  let fixture: ComponentFixture<RetrospectiveMessageComponent>;
  let retroSessionServiceMock: RetroSessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrospectiveMessageComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ RetroSessionService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetrospectiveMessageComponent);
    component = fixture.componentInstance;
    retroSessionServiceMock = fixture.debugElement.injector.get(RetroSessionService);
  });

  it('should create', () => {
    component.message = {id: 10, col: 1, txt: 'Testing', votes: undefined};
    component.userId = 2;
    component.availableVotes = 3;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
