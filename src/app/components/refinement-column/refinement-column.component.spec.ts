import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefinementColumnComponent } from './refinement-column.component';

describe('RefinementColumnComponent', () => {
  let component: RefinementColumnComponent;
  let fixture: ComponentFixture<RefinementColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefinementColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefinementColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
