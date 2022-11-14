import { TestBed } from '@angular/core/testing';

import { SwapV1V2Service } from './swapv1v2.service';

describe('SwapService', () => {
  let service: SwapV1V2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapV1V2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
