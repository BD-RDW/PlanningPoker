import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsViewComponent } from './cards-view.component';

describe('CardsViewComponent', () => {
  let component: CardsViewComponent;
  let fixture: ComponentFixture<CardsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardsViewComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    // https://stackoverflow.com/questions/51422496/karma-input-parameter-unit-testing
    // https://betterprogramming.pub/testing-angular-components-with-input-3bd6c07cfaf6
    expect(component).toBeTruthy();
  });
});
