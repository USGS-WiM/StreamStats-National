import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';
import * as L from 'leaflet';
import { Config } from 'protractor';
import { ConfigService } from '../shared/config/config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WorkflowService } from '../shared/services/workflow.service';
import "leaflet/dist/images/marker-shadow.png";
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../shared/messageType';
import * as esri from 'esri-leaflet';
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { LoaderService } from '../shared/services/loader.service';
import { AppService } from '../shared/services/app.service';
import area from '@turf/area';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public authHeader: HttpHeaders;
  private configSettings: Config;
  private messager: ToastrService;
  public clickPoint;
  public currentZoom: number = 4;
  public latestDischarge: any;
	public workflowLayers = [] as any;
	public activeWorkflowLayers:any;
  public selectedFeature: any;
  public marker: L.Marker;
  public basin: any;
  public splitCatchmentLayer: any;
  public traceLayer;
  public fitBounds: L.LatLngBounds;
  public selectedWorkflow: Workflow;
  public loader: boolean;
  public selectedPopup: any;
  public selectedSite: any
  public streamgageLayer: any;
  public streamgageLayerStatus: boolean;
  public workflowData: any;
  public count: number = 0;
  public firePerimeterLayer;
  public selectedPerimeters = [];

  constructor(public _mapService: MapService, private _configService: ConfigService, private _http:
    HttpClient, private _workflowService: WorkflowService, public toastr: ToastrService, private _loaderService: LoaderService, private _appService: AppService) { 
    this.configSettings = this._configService.getConfiguration();
    this.messager = toastr;
  }

  ngOnInit() {
    // Initialize map
    this._mapService.map =  L.map('map', {
      center: L.latLng(41.1, -98.7),
      zoom: 4,
      minZoom: 4,
      maxZoom: this._mapService.chosenBaseLayer.maxZoom,
      renderer: L.canvas(),
      zoomControl: false
    });

    // Add basemap
    this._mapService.SetBaselayer(this._mapService.chosenBaseLayerName);

    // Get available workflow layers / Get active workflow layers
    this.workflowLayers = this._mapService.workflowLayers;
    this._mapService.activeWorkflowLayers.subscribe(activeLayers => {
      this.activeWorkflowLayers = activeLayers;
    })

    // Get streamgages toggle status
    this._mapService.streamgageLayerStatus.subscribe((status: boolean) => {
      this.streamgageLayerStatus = status;
      if (this.streamgageLayerStatus) {
        this.setBbox();
      }
    })

    // Add scale bar
    this._mapService.scale.addTo(this._mapService.map);

    // Add custom zoom/home buttons
    this._mapService.zoomHome.addTo(this._mapService.map);

    // Add textbox in bottom left with map scale information
    this._mapService.textBox.addTo(this._mapService.map);
    this._mapService.map.on('zoomend', e => {
      this._mapService.textBox.addTo(this._mapService.map); //Reload text box
    });

    // Add compass
    // this._mapService.map.addControl(this._mapService.compass);
    
    // Get streamgages
    this._mapService.waterData.subscribe((wd: {}) => {
      this.latestDischarge = wd;
      if (this.latestDischarge) {
        this.updatePopup(this.selectedSite, this.selectedPopup, this.selectedFeature);
      }
    })
    // Get current discharge
    this._mapService.streamgages.subscribe((sg: {}) => {
      this.streamgageLayer = sg;
      if (this.streamgageLayer) {
        this.addGeoJSON("streamgages", this.streamgageLayer);
      }
    })
    // Setting local click point variable
    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickPoint = point;
    })
    // On map click, set click point value
    this._mapService.map.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
      this._mapService.setClickPoint(evt.latlng);
      if (this.selectedWorkflow) {
        if (this.workflowData) {
          if (this.workflowData.title == "Delineation" && this.workflowData.steps[0].completed) { 
            this.onMouseClickDelineation();
          }
          if (this.workflowData.title === "Fire Hydrology" && this.workflowData.steps[0].completed) {
            if (this.workflowData.steps[1].name === "selectFireHydroBasin") {
              this.onMouseClickDelineation();
            }
            if (this.workflowData.steps[1].name === "selectFireHydroPerimeter") {
              this.onMouseClickFireHydroQueryFirePerimeter();
            }
          }
        }
      }
    }) 
    // On map zoom, set current zoom, display gages
    this._mapService.map.on('zoomend',(evt) => {
      this.currentZoom = evt.target._zoom;
      this._mapService.setCurrentZoomLevel(evt.target._zoom);
      this.setBbox();
    }) 
    // On map drag, display gages
    this._mapService.map.on('dragend',() => {
      this.setBbox();
    })
    // Subscribe to workflow
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflow = res;
      if (this.selectedWorkflow) {
        if(this.selectedWorkflow.title != "Delineation") {
          this.checkAvailableLayers();
        }
      }
      if (!this.selectedWorkflow){
        this.removeWorkFlowLayers();
      }
    });

    //Subscribe to the form data
    this._workflowService.formData.subscribe(async data => {
      this.workflowData = data;
      if (this.workflowData) {
        if (this.workflowData.title == "Delineation" || this.workflowData.title == "Fire Hydrology") {
          this.checkAvailableLayers();
        }
        if (this.workflowData.title == "Fire Hydrology") {
          if (this.workflowData.steps[1].name === "selectFireHydroBasin" && this.workflowData.steps[2].completed) {
              this._loaderService.showFullPageLoad();

              // Check for valid burn years
              let startBurnYear = this.workflowData.steps[2].options[0].text;
              let endBurnYear = this.workflowData.steps[2].options[1].text;
              if (this.validateBurnYears(startBurnYear, endBurnYear)) {
                this.createMessage("Calculating basin characteristics and streamflow estimates. Please wait.");
  
                // Basin Area
                let basinFeature = this.basin.features[1];
                this._mapService.setBasinArea(area(basinFeature) / 1000000);
  
                // Burned Area
                this._mapService.setBurnYears([startBurnYear, endBurnYear]);
                let burnedArea = await this._mapService.queryBurnedArea(basinFeature, startBurnYear, endBurnYear);
                this._mapService.setBurnedArea(burnedArea);

                // Geology
                let geologyResults = await this._mapService.queryGeology(basinFeature);
                this._mapService.setGeologyReport(geologyResults);

                // Basin characteristics
                let basinCharacteristics = await this._mapService.queryPrecomputedBasinCharacteristics(this.clickPoint.lat, this.clickPoint.lng);
                this._mapService.setBasinCharacteristics(basinCharacteristics);

                // Streamflow Estimates
                await this._mapService.calculateFireStreamflowEstimates(basinFeature);
                this.createMessage("Basin characteristics and streamflow estimates were successfully calculated.");
              } else {
                this.createMessage("Please enter valid Burn Years.", 'error');
              }
              this._loaderService.hideFullPageLoad();

              
          }
        }
      }
      if (!this.workflowData) {
        this.removeWorkFlowLayers();
      } 
    });

    //Subscribe to loader state
    this._loaderService.loaderState.subscribe((state: boolean) => {
      this.loader = state;
    });

    this.loadLayers();
  }

  public validateBurnYears(startBurnYear, endBurnYear) {
    // Check if both burn years are 4-digit numbers
    if (!/^\d{4}$/.test(startBurnYear) || !/^\d{4}$/.test(endBurnYear)) {
      return false;
    } else {
      return true;
    }
  }

  public removeWorkFlowLayers(){
    Object.keys(this.workflowLayers).forEach(layerName => {
      this._appService.setLayerVisibility(layerName);
      this._mapService.removeWorkflowLayers(layerName);
      this.removeLayer(this.workflowLayers[layerName]); // No workflow is selected; remove all workflow overlayers
    });
  }

  public checkAvailableLayers(){
    if (this.selectedWorkflow) {
      switch (this.selectedWorkflow.title) {
        case "Delineation":
          if (!this.activeWorkflowLayers.length) {
            if (this.workflowData && this.workflowData.steps || this.activeWorkflowLayers.name != "NHD Flowlines") {
              this.workflowData.steps[0].options.forEach(o => {
                if (o.text == "NLDI Delineation" && o.selected == true) {
                  this.addLayers('NHD Flowlines', true);
                }
              });
            }
          }
          break;
        case "Fire Hydrology":
          if (!this.activeWorkflowLayers.length) {
            if (this.workflowData && this.workflowData.steps) {
              this.workflowData.steps[0].options.forEach((o: { text: string; selected: boolean; }) => {
                if (o.text === "Query by Basin" && o.selected === true) {
                  this.addLayers('NHD Flowlines', true);
                  this.addLayers('Archived Wildland Fire Perimeters', true);
                  this.addLayers('2021 Wildland Fire Perimeters', true);
                  this.addLayers('2022 Wildland Fire Perimeters', true);
                  this.addLayers('MTBS Fire Boundaries', true);
                  this.addLayers('Burn Severity', true);
                }
                if (o.text === "Query by Fire Perimeters" && o.selected === true) {
                  this.addLayers('Archived Wildland Fire Perimeters', true);
                  this.addLayers('2021 Wildland Fire Perimeters', true);
                  this.addLayers('2022 Wildland Fire Perimeters', true);
                  this.addLayers('MTBS Fire Boundaries', true);
                  this.addLayers('Burn Severity', true);
                }
              })
            }
          }
          break;
      }
    }
  }

  private loadLayers() {
    if (this.configSettings) {
      this.configSettings.workflowLayers.forEach(ml => {
        try {
          let options;
          let url;
          switch (ml.type) {
            case "WMS":
              options = ml.layerOptions;
              url = ml.url;
              this.workflowLayers[ml.name] = L.tileLayer.wms(url, options);
              break;
            case "agsDynamic":
              options = ml.layerOptions;
              options.url = ml.url;
              this.workflowLayers[ml.name] = esri.dynamicMapLayer(options);
              break;
            case "agsFeature":
              options = ml.layerOptions;
              options.url = ml.url;
              this.workflowLayers[ml.name] = esri.featureLayer(options);
              if (this.configSettings.symbols[ml.name]) { 
                this.workflowLayers[ml.name].setStyle(this.configSettings.symbols[ml.name]); 
              }
              break;
          }
        } catch (error) {
          this.createMessage(ml.name + ' layer failed to load','error');
        }
      });
    }
  }

  public addLayers(layerName: string, visible: boolean) {
    this.configSettings.workflowLayers.forEach((layer: any) => {
      if (layer.name === layerName) {
        layer.visible = visible;
        this._mapService.setWorkflowLayers(layer);
        if (layer.visible) { 
          this.workflowLayers[layerName].addTo(this._mapService.map);
        }
      }
    }); 
  }

  public setBbox(){
    if (this.streamgageLayer !== undefined) {
      this._mapService.map.removeLayer(this.streamgageLayer);
      this.configSettings.overlays.forEach((overlay: any) => {
        if (overlay.name === "Streamgages") {
          overlay.visible = false;
        }
      });
    }
    if (this.currentZoom >= 8) {
      var bBox = this._mapService.map.getBounds();
      var ne = bBox.getNorthEast(); // LatLng of the north-east corner
      var sw = bBox.getSouthWest(); // LatLng of the south-west corder
      if (this.streamgageLayerStatus) {
        this._mapService.setStreamgages(sw.lng, ne.lng, sw.lat, ne.lat)
      }
    }
  }
  
  public addGeoJSON(LayerName: string, feature: any) {
    if (LayerName == 'streamgages') {
      var self = this;
      var MyIcon = L.icon({
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARVJREFUOI3d1L8rhVEYB/APqROD9C66xSBJDH4MLAYLi4XFJKKYlDBSlpvJrpRBstn8G2b/gXoHdTbDs8jgKt38eF138q1T55yn59MznE6XNqfr34CduMYGXtoB7mIeO7j4K9iXUlqLiAFs4gbPfwHrETHR2E/ gGEetguOYQ3fj3JNSWoyIczy2Ap5i6uNFREyhjq3fgssYRccnPZNFUczknO + rggn7GPuiPp1zPsZKVfAQw1 / U3jOCVdz + BNawhMEfwHFs4w7xHVj39jyqZAR7OPsULIpiNuc8ht6K4BAWcIWnZrAj53yC2YrYeyZTSkcRcdAMrjew3 / 5A/RGxWqvVLsuyfPjYfN1YLaUsS80TtiVtB18BHWxAwwk6imsAAAAASUVORK5CYII=',
        iconSize: [15, 16],
        iconAnchor: [7.5, 8],
        popupAnchor: [0, -11],
      });
      this.streamgageLayer = L.geoJSON(feature, {
        onEachFeature: async function (feature, layer) {
          var siteNo = feature.properties['Code'];
          var loadingHTML =  'Loading';
          layer.bindPopup(loadingHTML);
          layer.on('click', onMarkerClick );
          function onMarkerClick(e: any) {
            var popup = e.target.getPopup();
            self.selectedSite = siteNo;
            self.selectedPopup = popup;
            self.selectedFeature = feature;
            self._mapService.setWaterServiceData(siteNo);
          }
        },
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng,{icon: MyIcon});
        }
      }).addTo(this._mapService.map);
      this.configSettings.overlays.forEach((overlay: any) => {
        if (overlay.name === "Streamgages") {
          overlay.visible = true;
        }
      });
      // setting streamgages layer in map services
      this._mapService.setStreamgagesLayer(this.streamgageLayer)
    }
  }

  public updatePopup(site:any, popup:any, feature:any){
    //Set dynamic content for popup
    var SSgagepage = 'https://streamstatsags.cr.usgs.gov/gagepages/html/' + site + '.htm';
    var NWISpage = 'http://nwis.waterdata.usgs.gov/nwis/inventory/?site_no=' + site;
    var innerHTML =  feature.properties['Name'] + ' ('  + site + ')' + '<hr><strong>Station Type</strong>: ' + 
    feature.properties.StationType.name + '</br><strong>Discharge, cfs: </strong>' +
    this.latestDischarge + '<br><strong>NWIS page: </strong><a href="' + 
    NWISpage +' "target="_blank">link</a></br><strong>StreamStats Gage page: </strong><a href="' + 
    SSgagepage + '" target="_blank">link</a></br>';
    popup.setContent( innerHTML );
  }

  // On map click, set click point value, for delineation
  public onMouseClickDelineation() { 
    this.removeLayer(this.splitCatchmentLayer);
    this.addPoint(this.clickPoint);
    this.marker.openPopup();
    this._loaderService.showFullPageLoad();
    this.createMessage("Delineating basin. Please wait.");
    this._mapService.getUpstream(this.clickPoint.lat, this.clickPoint.lng, "True");
    this._mapService.delineationPolygon.subscribe((poly: any) => {
      this.basin = poly;
      if (this.basin) {  
        this.removeLayer(this.splitCatchmentLayer);  
        this.splitCatchmentLayer = L.geoJSON(this.basin.features[1]);
        this.splitCatchmentLayer.addTo(this._mapService.map);
        if (!this.splitCatchmentLayer.getBounds().isValid()) {
          this.createMessage("Error. Basin cannot be delineated.");
        } else {
          this._mapService.map.fitBounds(this.splitCatchmentLayer.getBounds(), { padding: [75,75] });
        }
      } else {
        this.createMessage("Error. Basin cannot be delineated.");
      }
      this._loaderService.hideFullPageLoad();
    });
  }

  public onMouseClickFireHydroQueryFirePerimeter() { 
    this._loaderService.showFullPageLoad();
    this.count = 0;
    this.selectedPerimeters = [];
    this.createMessage('Querying layers. Please wait.');
    Object.keys(this.workflowLayers).forEach(layerName => {
      if (layerName === '2022 Wildland Fire Perimeters' || layerName === '2021 Wildland Fire Perimeters' || layerName === 'Archived Wildland Fire Perimeters') {
        this.workflowLayers[layerName].query().nearby(this.clickPoint, 4).returnGeometry(true)
          .run((error: any, results: any) => {
            this.findFeatures(error,results,layerName);
          }
        );
      } else if (layerName === 'MTBS Fire Boundaries') {
        this.workflowLayers[layerName].identify().on(this._mapService.map).at(this.clickPoint).returnGeometry(true).tolerance(5)
          .run(async (error: any, results: any) => {
            this.findFeatures(error,results,layerName);
          }
        );
      }
    });
  }

  public async findFeatures(error,results,layerName) {
    let popupcontent;
    const shownFields = ['INCIDENTNAME', 'COMMENTS', 'GISACRES', 'FIRE_YEAR', 'CREATEDATE', 'ACRES', 'AGENCY', 'SOURCE', 'INCIDENT', 'FIRE_ID', 'FIRE_NAME', 'YEAR', 'STARTMONTH', 'STARTDAY', 'FIRE_TYPE', 
    'POLY_INCIDENTNAME','POLY_GISACRES', 'POLY_DATECURRENT', 'IRWIN_FIRECAUSE', 'IRWIN_FIRECAUSEGENERAL', 'IRWIN_FIREDISCOVERYDATETIME','IRWIN_FIREOUTDATETIME','IRWIN_UNIQUEFIREIDENTIFIER'];
    if (error) {
      this.createMessage('Error occurred.','error');
      this._loaderService.hideFullPageLoad();
    } 
    if (results && results.features.length > 0) {
      results.features.forEach(feat => {
        popupcontent = '<div class="popup-header"><b>' + layerName + ':</b></div><br>';
        if (layerName === 'MTBS Fire Boundaries') {
          let date = feat.properties.STARTMONTH + '/' + feat.properties.STARTDAY + '/' + feat.properties.YEAR;
          if (date.indexOf('undefined') > -1) date = 'N/A';
        }
        Object.keys(feat.properties).forEach(prop => {
          if (shownFields.indexOf(prop.toUpperCase()) > -1) {
            let val = feat.properties[prop];
            if (prop.toLowerCase().indexOf('date') > -1) {
              val = new Date(val).toLocaleDateString();
            }
            popupcontent += '<b>' + prop + ':</b> ' + val + '<br>';
          }
        });
        popupcontent += '<br>';
        if (layerName === 'MTBS Fire Boundaries') {
          this.firePerimeterLayer = L.geoJSON(feat.geometry);
        } else if (layerName === '2022 Wildland Fire Perimeters' || layerName === '2021 Wildland Fire Perimeters' || layerName === 'Archived Wildland Fire Perimeters') {
          const col = layerName.indexOf('Active') > -1 ? 'yellow' : 'red';
          this.firePerimeterLayer = L.geoJSON(feat.geometry, {style: {color: col}});
        }
        this.firePerimeterLayer.addTo(this._mapService.map);
        this.addBurnPoint(this.firePerimeterLayer.getBounds().getCenter(), popupcontent);
      });
      this.selectedPerimeters.push({ 'Key': layerName, 'Data': results})
      const data = await this._mapService.trace(results).toPromise();
      this.addTraceLayer(data);
    }
    this._mapService.setSelectedPerimeters(this.selectedPerimeters);
    this.count ++;
    this.checkCount(this.count, 4);
  }

  public addTraceLayer(data) {
    this.traceLayer = L.geoJSON(data);
    this._mapService.setFirePerimetersLayers(this.firePerimeterLayer, this.traceLayer);
    this.traceLayer.addTo(this._mapService.map);
    this._mapService.map.fitBounds(this.traceLayer.getBounds(), { padding: [75,75] });
    this._loaderService.hideFullPageLoad();
  }

  public checkCount(count, goal) {
    if (count === goal) {
      if (this.loader == true) {
        this._loaderService.hideFullPageLoad();
        this.createMessage('Must select a fire perimeter.','error');
      }
    }
  }

  public addBurnPoint(latlng, popupcontent) {
    this.marker = L.marker(latlng).bindPopup(popupcontent).openPopup();
    this._mapService.map?.addLayer(this.marker);
    this.marker.openPopup();
  }

  public addPoint(latlng: any) {
    this.removeLayer(this.marker);
    const content = '<div><b>Latitude:</b> ' + latlng.lat + '<br><b>Longitude:</b> ' + latlng.lng;
    this.marker = L.marker(latlng).bindPopup(content).openPopup();
    this._mapService.map?.addLayer(this.marker);
  }

  public removeLayer(layer: any) {
    if (this._mapService.map.hasLayer(layer)) {
      this._mapService.map.removeLayer(layer);
    }
  }

  private createMessage(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
    try {
      let options: Partial<IndividualConfig> = null;
      if (timeout) { options = { timeOut: timeout }; }
      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }
}
