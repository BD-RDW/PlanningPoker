import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrospectiveMessageComponent } from './retrospective-message.component';

describe('RetrospectiveMessageComponent', () => {
  let component: RetrospectiveMessageComponent;
  let fixture: ComponentFixture<RetrospectiveMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrospectiveMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrospectiveMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
