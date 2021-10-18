import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionService } from 'src/app/service/session.service';

import { RetrospectiveColumnComponent } from './retrospective-column.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('RetrospectiveColumnComponent', () => {
  let component: RetrospectiveColumnComponent;
  let fixture: ComponentFixture<RetrospectiveColumnComponent>;
  let service: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrospectiveColumnComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ SessionService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrospectiveColumnComponent);
    component = fixture.componentInstance;
    service = fixture.debugElement.injector.get(SessionService);
  });

  it('should create', () => {
    component.userId = 1;
    component.columnData = {
      title: 'ColumnTitle',
      column: 2,
      notes: []
    };
    component.availableVotes = 10;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
