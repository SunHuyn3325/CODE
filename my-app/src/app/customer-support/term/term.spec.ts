import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Term } from './term';

describe('Term', () => {
  let component: Term;
  let fixture: ComponentFixture<Term>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Term]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Term);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
