import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ship } from './ship';

describe('Ship', () => {
  let component: Ship;
  let fixture: ComponentFixture<Ship>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ship]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ship);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
