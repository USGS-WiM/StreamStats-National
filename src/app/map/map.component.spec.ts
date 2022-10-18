import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { MapComponent } from './map.component';
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { ConfigService } from '../shared/config/config.service';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  // Mock workflow
  let workflow: Workflow = {
    title: "Fire Hydrology",
    description: "",
    functionality: "",
    icon: "",
    steps: [
      {
          "label": "Select a Fire Hydrology Query Method",
          "name": "selectFireHydroProcess",
          "description":"Choose from list of fire hydrology query methods.",
          "type": "checkbox",
          "value": "",
          "options":
          [
              {
                  "text": "Query by Basin",
                  "selected": true,
                  "nestedSteps": 
                  [
                      {
                          "label": "Select a Point",
                          "description": "",
                          "name": "selectFireHydroBasin",
                          "type": "subscription",
                          "value": "",
                          "validators": 
                          {
                              "required": true
                          },
                          "options": 
                          [
                              {
                                  "text": "Click on the map",
                                  "selected": false
                              }
                          ]
                      },
                  ]
              },
              {
                "text": "Query by Fire Perimeters",
                "selected": false,
                "nestedSteps": 
                [
                    {
                        "label": "Select a Fire Perimeter",
                        "name": "selectFireHydroPerimeter",
                        "description": "",
                        "type": "subscription",
                        "value": "",
                        "validators": 
                        {
                            "required": true
                        },
                        "options": 
                        [
                            {
                                "text": "Click on the map",
                                "selected": false
                            }
                        ]
                    }
                ]
            }
          ]
      }
    ],
    output: []
  };

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create workflow layers', () => {
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

  it('should remove workflow layers', () => {
    // Need to load the layers and add to map first to test removing them
    component["loadLayers"]();
    component["addLayers"]("NHD Flowlines", true);
    // Remove layers
    component["removeWorkFlowLayers"]();
    expect(component._mapService.map.hasLayer(component.workflowLayers["NHD Flowlines"])).toBeFalse();
  });

  it('should check available layers in workflow and add Query by Basin layers', () => {
    let addLayerSpy = spyOn(component, "addLayers");
    component.selectedWorkflow = workflow;
    component.workflowData = workflow;

    component.workflowData.steps[0].options[0].selected = true;
    component.workflowData.steps[0].options[1].selected = false;
    // Check available layers
    component["checkAvailableLayers"]();
    expect(addLayerSpy).toHaveBeenCalledWith("NHD Flowlines", true);
    expect(addLayerSpy).toHaveBeenCalledWith("2019 Wildland Fire Perimeters", true);
  });

  it('should check available layers in workflow and add Query by Fire Parameters layers', () => {
    let addLayerSpy = spyOn(component, "addLayers");
    
    component.selectedWorkflow = workflow;
    component.workflowData = workflow;

    component.workflowData.steps[0].options[0].selected = false;
    component.workflowData.steps[0].options[1].selected = true;
    // Check available layers
    component["checkAvailableLayers"]();
    expect(addLayerSpy).not.toHaveBeenCalledWith("NHD Flowlines", true);
    expect(addLayerSpy).toHaveBeenCalledWith("2019 Wildland Fire Perimeters", true);
  });

  it('should add layers', () => {
    let setWorkflowLayersSpy = spyOn(component._mapService, "setWorkflowLayers");

    // Need to load layers to test adding them to the map
    component["configSettings"] = {workflowLayers: component._mapService.workflowLayers};
    component["loadLayers"]();
    // Check available layers
    component.addLayers("NHD Flowlines", true);
    expect(setWorkflowLayersSpy).toHaveBeenCalled();
  });

  it('should set streamgage bounding box', () => {
    let setStreamgagesSpy = spyOn(component._mapService, "setStreamgages");

    component.currentZoom = 10;
    component.streamgageLayerStatus = true;
    // Check available layers
    component.setBbox();
    expect(setStreamgagesSpy).toHaveBeenCalled();
  });
});
