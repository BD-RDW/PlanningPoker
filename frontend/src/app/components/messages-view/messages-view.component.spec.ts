import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MessagesViewComponent } from './messages-view.component';

describe('MessagesViewComponent', () => {
  let component: MessagesViewComponent;
  let fixture: ComponentFixture<MessagesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessagesViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesViewComponent);
    component = fixture.componentInstance;
    component.messageReceived = of('testing');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
