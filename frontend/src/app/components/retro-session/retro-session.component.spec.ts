import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Params } from '@angular/router';

import { RetroSessionComponent } from './retro-session.component';
import { MessageService } from 'primeng/api';

describe('RetroSessionComponent', () => {
  let component: RetroSessionComponent;
  let fixture: ComponentFixture<RetroSessionComponent>;
  let activatedRouteStub: MockActivatedRoute;
  let messageService: MessageService;

  beforeEach(async () => {
    activatedRouteStub = new MockActivatedRoute();
    await TestBed.configureTestingModule({
      declarations: [ RetroSessionComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        MessageService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetroSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    messageService = fixture.debugElement.injector.get(MessageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

class MockActivatedRoute {
  private innerTestParams?: any;
  private subject?: BehaviorSubject<any> = new BehaviorSubject(this.testParams);

  params = this.subject.asObservable();
  queryParams = this.subject.asObservable();

  constructor(params?: Params) {
    if (params) {
      this.testParams = params;
    } else {
      this.testParams = {};
    }
  }

  get testParams() {
    return this.innerTestParams;
  }

  set testParams(params: {}) {
    this.innerTestParams = params;
    this.subject.next(params);
  }

  get snapshot() {
    return { params: this.testParams, queryParams: this.testParams };
  }
}