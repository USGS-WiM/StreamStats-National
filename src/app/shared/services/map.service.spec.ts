import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { MapService } from './map.service';
import * as L from 'leaflet';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

describe('MapService', () => {
  let service: MapService;

  // Create div for testing map
  let div = document.createElement('div');
  document.body.appendChild(div)
  div.id = 'testmap';

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

  beforeEach(() => {
    // Mock data
    service.baseMaps = { 
      "World Topographic": service["loadLayer"]({
      "name": "World Topographic",
      "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      "attribution": "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
      "visible": false,
      "maxZoom": 19
      }),
      "National Geographic": service["loadLayer"]({ 
        "name": "National Geographic",
        "url": "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
        "attribution": "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
        "visible": true,
        "maxZoom": 16
      }),
    };
    service.chosenBaseLayerName = "National Geographic";
    service.map = L.map('testmap', {
      center: L.latLng(41.1, -98.7),
      zoom: 4,
      minZoom: 4,
      maxZoom: 16,
      renderer: L.canvas(),
      zoomControl: false
    });
  });

  afterEach(() => {
    service.map.remove()
  })

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
  
  it('should add a map layer', () => {
    const marker = L.marker([43, -89]);
    let layer = { name: 'Search Location', layer: marker, visible: true }
    service.AddMapLayer(layer);
    expect(service.map.hasLayer(layer["layer"])).toBeTrue();
  });

  it('should toggle baselayers', () => {
    service.SetBaselayer("World Topographic");
    expect(service.baseMaps["World Topographic"].visible).toBeTrue();
    expect(service.chosenBaseLayerName).toEqual("World Topographic");
  });

  it('should zoom to location', () => {
    service.zoomLocation();
    let circlemarker = false;
    service.map.eachLayer(function(layer){
      if(layer instanceof L.CircleMarker){
        circlemarker = true;
      }
    })
    expect(circlemarker).toBeTrue();
  });

  it('should load a layer', () => {
    let layer = {
      "World Topographic": {
        "name": "World Topographic",
        "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        "attribution": "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
        "visible": false,
        "maxZoom": 19
      },
    }
    // Test private method loadLayer
    let tileLayer = service["loadLayer"](layer);
    expect(tileLayer["options"]).not.toEqual(undefined)
  });
});
