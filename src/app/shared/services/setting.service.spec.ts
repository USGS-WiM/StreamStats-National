import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SettingService } from './setting.service';

describe('SettingService', () => {
  let service: SettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(SettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getEntities() should http GET', () => { //Could most likely make this better in the future
    service.getEntities('https://streamstats.usgs.gov/gagestatsservices/apiconfig').subscribe((res) => {
      console.log(res)
      expect(res).toBeDefined();
    });
  });
});
