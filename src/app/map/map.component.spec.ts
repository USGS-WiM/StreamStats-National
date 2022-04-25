import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { MapComponent } from './map.component';
import { ConfigService } from '../shared/config/config.service';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ToastrModule.forRoot(),
      ],
      declarations: [ MapComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    component._mapService.chosenBaseLayer = {
      "name": "World Topographic",
      "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      "attribution": "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
      "visible": true,
      "maxZoom": 19
    };
    component._mapService.chosenBaseLayerName = "World Topographic";
    component._mapService.workflowLayers = [ 
        {
          "name": "NHD Flowlines",
          "url": "https://labs.waterdata.usgs.gov/geoserver/gwc/service/",
          "type": "WMS",
          "layerOptions": {
              "layers": "wmadata:nhdflowline_network",
              "minZoom": 13,
              "maxZoom": 19,
              "zIndex": 9999,
              "format": "image/png",
              "transparent": "true"
          }
        },
      ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create workflow layers', () => {
    component["configSettings"] = {
      workflowLayers: [ 
        {
          "name": "NHD Flowlines",
          "url": "https://labs.waterdata.usgs.gov/geoserver/gwc/service/",
          "type": "WMS",
          "layerOptions": {
              "layers": "wmadata:nhdflowline_network",
              "minZoom": 13,
              "maxZoom": 19,
              "zIndex": 9999,
              "format": "image/png",
              "transparent": "true"
          }
        },
      ]
    };
    // Method is private
    component["loadLayers"]();
    expect(component.workflowLayers["NHD Flowlines"].options.layers).toEqual("wmadata:nhdflowline_network");
  });

  it('should #setClickPoint from map click event', () => {
    //mock click data
    const click = {evt: {latlng: {lat: 45, lng: -93}}};
    let clickSpy = spyOn(component["_mapService"], 'setClickPoint');
    component["_mapService"]["map"].fireEvent('click', click);
    fixture.detectChanges();
    expect(clickSpy).toHaveBeenCalledWith(click["latlng"])
  });
});
