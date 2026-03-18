import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipMethod } from './ship-method';

describe('ShipMethod', () => {
  let component: ShipMethod;
  let fixture: ComponentFixture<ShipMethod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipMethod]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipMethod);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
