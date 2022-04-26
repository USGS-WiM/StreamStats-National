import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { MapService } from './map.service';

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MapService
      ],
      imports: [
        HttpClientTestingModule,
        ToastrModule.forRoot()
      ]
    });
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add overlay layers', () => {
    let overlay = [
      {
          "name": "Streamgages",
          "url": "https://streamstats.usgs.gov/gagestatsservices/stations",
          "layerOptions": {
              "minZoom": 8
          },
          "visible": false
      }
    ]
    service.setOverlayLayers(overlay);
    expect(service.overlaysSubject).toEqual([overlay]);
  });

  it('should set the streamgages layer', () => {
    // Mock layer
    let layer = [
      {
          "name": "Streamgages",
      }
    ]
    service.setStreamgagesLayer(layer);
    expect(service.streamgageLayer).toEqual(layer);
  });

  xit('should toggle workflow layers', () => {
    service.activeLayers = [{name: "NHD Flowlines", visible: false, layerOptions: {minZoom: 8}}];
    service.workflowLayers = [{name: "NHD Flowlines", visible: false, layerOptions: {minZoom: 8}}];
    service.toggleWorkflowLayers("NHD Flowlines");
  });
});
