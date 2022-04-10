import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionService } from 'src/app/service/session.service';

import { RetroColumnComponent } from './retro-column.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('RetroColumnComponent', () => {
  let component: RetroColumnComponent;
  let fixture: ComponentFixture<RetroColumnComponent>;
  let service: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetroColumnComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ SessionService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetroColumnComponent);
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
