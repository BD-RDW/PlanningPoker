import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultViewComponent } from './result-view.component';

describe('ResultViewComponent', () => {
  let component: ResultViewComponent;
  let fixture: ComponentFixture<ResultViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultViewComponent);
    component = fixture.componentInstance;
    component.users = [ {id: 0, name: 'Jan', role: 'Test', vote: '1'} ];
    component.choices = [];
    component.colors = [];
    fixture.detectChanges();
  });
  afterEach(() => {
    // clean up here.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // jasmine spyOn
  
});
