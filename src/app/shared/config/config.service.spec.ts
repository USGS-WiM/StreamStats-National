import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { environment } from 'src/environments/environment';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ConfigService);
    spyOn(service, 'loadConfig').and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loadConfig should be called', () => {
    service.loadConfig(environment.configFile);
    expect(service.loadConfig).toHaveBeenCalled();
  });

});
