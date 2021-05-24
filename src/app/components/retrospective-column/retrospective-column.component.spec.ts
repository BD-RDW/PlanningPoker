import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrospectiveColumnComponent } from './retrospective-column.component';

describe('RetrospectiveColumnComponent', () => {
  let component: RetrospectiveColumnComponent;
  let fixture: ComponentFixture<RetrospectiveColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrospectiveColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrospectiveColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
