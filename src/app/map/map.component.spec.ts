import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { Workflow } from '../shared/interfaces/workflow/workflow';

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
        HttpClientTestingModule
      ],
      declarations: [ MapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove workflow layers', () => {
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
    expect(addLayerSpy).toHaveBeenCalledWith("Archived Wildland Fire Perimeters", true);
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
    expect(addLayerSpy).toHaveBeenCalledWith("Archived Wildland Fire Perimeters", true);
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
