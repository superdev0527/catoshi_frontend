import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapV1V2Component } from './swapv1v2.component';

describe('SwapComponent', () => {
  let component: SwapV1V2Component;
  let fixture: ComponentFixture<SwapV1V2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwapV1V2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapV1V2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
