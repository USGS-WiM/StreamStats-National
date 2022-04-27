import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { MapService } from './map.service';
import * as L from 'leaflet';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Config } from '../interfaces/config/config';

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
    let overlayValue = [{}];
    service.overlayLayers.subscribe((value) => {
			overlayValue = value;
		});
    service.setOverlayLayers(overlay);
    expect(service.overlaysSubject).toEqual([overlay]);
    expect(overlayValue).toEqual([overlay]);
  });

  it('should add overlay layers', () => {
    // Mock streamgage layer and overlays
    service.streamgageLayer = {name: 'Streamgages', layer: new L.CircleMarker([0, 0])};
    service.overlays = [{name: 'Test', layer: new L.CircleMarker([0, 0])}];
    // Mock config settings
    service["configSettings"] = <Config>{};
    service["configSettings"].overlays = [
      {
          "name": "Streamgages",
          "url": "https://streamstats.usgs.gov/gagestatsservices/stations",
          "layerOptions": {
              "minZoom": 8
          },
          "visible": false
      }, {
          "name": "Test",
          "url": "",
          "layerOptions": {
              "minZoom": 8
          },
          "visible": false
      }
    ]
    let spy = spyOn(service.map, 'addLayer');
    let removeSpy = spyOn(service.map, 'removeLayer');
    // Add layers
    service.setOverlayLayer("Streamgages");
    expect(service["configSettings"]["overlays"][0]["visible"]).toBeTrue();
    expect(spy).toHaveBeenCalledWith(service.streamgageLayer);

    service.setOverlayLayer("Test");
    expect(service["configSettings"]["overlays"][1]["visible"]).toBeTrue();
    expect(spy).toHaveBeenCalledWith(service.overlays['Test']);

    // Remove layers
    service["configSettings"].overlays[1].visible = true;
    service.setOverlayLayer("Test");
    expect(service["configSettings"]["overlays"][1]["visible"]).toBeFalse();
    expect(removeSpy).toHaveBeenCalledWith(service.overlays['Test']);
    
    service["configSettings"].overlays[0].visible = true;
    service.setOverlayLayer("Streamgages");
    expect(service["configSettings"]["overlays"][0]["visible"]).toBeFalse();
    expect(removeSpy).toHaveBeenCalledWith(service.overlays['Streamgages']);
  });

  it('should set the streamgages layer', () => {
    // Mock layer
    let layer = [
      {
          "name": "Streamgages",
      }
    ]
    let streamgagesValue;
    service.streamgagesLayer.subscribe((value) => {
			streamgagesValue = value;
		});
    service.setStreamgagesLayer(layer);
    expect(service.streamgageLayer).toEqual(layer);
    expect(streamgagesValue).toEqual(layer);
  });

  it('should set the streamgage layer status to true', () => {
    // Mock element
    let el = {nativeElement: {id: "Streamgages", checked: true}}
    
    service.setStreamgageLayerStatus(el);
    expect(service.streamgageStatus).toBeTrue();
  });

  it('should set the streamgage layer status to false', () => {
    // Mock element
    let el = {nativeElement: {id: "Streamgages", checked: false}}
    
    service.setStreamgageLayerStatus(el);
    expect(service.streamgageStatus).toBeFalse();
  });

  it('should toggle workflow layers', () => {
    service.workflowLayers = {'NHD Flowlines': new L.CircleMarker([0, 0])};
    service.activeLayers = [{name: "NHD Flowlines", visible: false, layerOptions: {minZoom: 8}}];

    service.toggleWorkflowLayers("NHD Flowlines");
    expect(service.map.hasLayer(service.workflowLayers["NHD Flowlines"])).toBeTrue();
    expect(service.activeLayers[0].visible).toBeTrue();

    service.activeLayers[0].visible = true;
    service.toggleWorkflowLayers("NHD Flowlines");
    expect(service.map.hasLayer(service.workflowLayers["NHD Flowlines"])).toBeFalse();
    expect(service.activeLayers[0].visible).toBeFalse();
  });

  it('should remove workflow layers from active layer list', () => {
    service.activeLayers = [{name: "NHD Flowlines", visible: false, layerOptions: {minZoom: 8}}];
    
    service.removeWorkflowLayers("NHD Flowlines");
    expect(service.activeLayers.length).toEqual(0);
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
    let circlemarker = false;
    service.zoomLocation();
    service.map.eachLayer(function(layer){
      if(layer instanceof L.CircleMarker){
        circlemarker = true;
      }
    })
    expect(circlemarker).toBeTrue();
  });

  it('should set the current zoom level', () => {
    let zoomValue = 8;
    service.currentZoomLevel.subscribe((zoom: number) => {
			zoomValue = zoom;
		});
    service.setCurrentZoomLevel(10);
    expect(zoomValue).toEqual(10);
  });

  it('should set the click point', () => {
    let latlngValue = {lat: 44, lng: 81};
    service.clickPoint.subscribe((latlng) => {
			latlngValue = latlng;
		});
    service.setClickPoint({lat: 43, lng: 80});
    expect(latlngValue).toEqual({lat: 43, lng: 80});
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
