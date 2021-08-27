import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AppService
      ]
    });
    service = TestBed.inject(AppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
    // it('getEntities() should http GET', () => { //Could most likely make this better in the future
  //   service.getEntities('https://streamstats.usgs.gov/gagestatsservices/apiconfig').subscribe((res) => {
  //     console.log(res)
  //     expect(res).toBeDefined();
  //   });
  // });
});