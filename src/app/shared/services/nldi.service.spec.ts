import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NLDIService } from './nldi.service';

describe('NLDIService', () => {
  let service: NLDIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NLDIService
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(NLDIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
