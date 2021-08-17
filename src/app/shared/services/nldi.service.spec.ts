import { TestBed } from '@angular/core/testing';

import { NLDIService } from './nldi.service';

describe('NLDIService', () => {
  let service: NLDIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NLDIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
