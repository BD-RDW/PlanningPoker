import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetroSessionComponent } from './retro-session.component';

describe('RetroSessionComponent', () => {
  let component: RetroSessionComponent;
  let fixture: ComponentFixture<RetroSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetroSessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetroSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
