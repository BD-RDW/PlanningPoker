import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefinementMessageComponent } from './refinement-message.component';

describe('RefinementMessageComponent', () => {
  let component: RefinementMessageComponent;
  let fixture: ComponentFixture<RefinementMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefinementMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefinementMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
