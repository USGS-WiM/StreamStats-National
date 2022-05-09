import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Config } from '../interfaces/config/config';

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

  it('should set layer visibility to false', () => {
    // Mock config settings
    service["configSettings"] = <Config>{};
    service["configSettings"].workflowLayers = [
      {
          "name": "Streamgages",
          "url": "https://streamstats.usgs.gov/gagestatsservices/stations",
          "layerOptions": {
              "minZoom": 8
          },
          "visible": true
      }, {
          "name": "Test",
          "url": "",
          "layerOptions": {
              "minZoom": 8
          },
          "visible": false
      }
    ]
    service.setLayerVisibility("Streamgages");
    expect(service["configSettings"].workflowLayers[0].visible).toBeFalse();
  });
});