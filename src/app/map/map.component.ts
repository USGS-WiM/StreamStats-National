import { Component, HostListener, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';
import * as L from 'leaflet';
import { Config } from 'protractor';
import { ConfigService } from '../shared/config/config.service';
import { FormBuilder } from '@angular/forms';
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
  public basinCharacteristics;
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
  public workflowForm: any;
  public count: number = 0;
  public numFiresInClick: number = 0;
  public firesinClick = [];
  public selectedPerimeterHighlight;
  public foundFire:boolean = false; 
  public firePerimeterLayer;
  public traceData = [];
  public cursor = 'auto';
  public selectedPerimeter: any;
  public outputLayers: L.LayerGroup;

  @HostListener('document:click', ['$event']) 
  clickout(event) 
  { 
    if (event.target.classList.contains("selectFire")) {
      this.selectFire(event.path[2].innerHTML); 
    }
  }

  constructor(public _mapService: MapService, private _configService: ConfigService, private _http:
    HttpClient, private _workflowService: WorkflowService, public toastr: ToastrService, private _loaderService: LoaderService, private _appService: AppService, private _fb: FormBuilder) { 
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
    this.outputLayers = L.layerGroup().addTo(this._mapService.map);

    // Add basemap
    this._mapService.SetBaselayer(this._mapService.chosenBaseLayerName);

    // Get available workflow layers / Get active workflow layers
    this.workflowLayers = this._mapService.workflowLayers;
    this._mapService.activeWorkflowLayers.subscribe(activeLayers => {
      this.activeWorkflowLayers = activeLayers;
    });

    // Get streamgages toggle status
    this._mapService.streamgageLayerStatus.subscribe((status: boolean) => {
      this.streamgageLayerStatus = status;
      if (this.streamgageLayerStatus) {
        this.setBbox();
      }
    });

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
    });

    // Get current discharge
    this._mapService.streamgages.subscribe((sg: {}) => {
      this.streamgageLayer = sg;
      if (this.streamgageLayer) {
        this.addGeoJSON("streamgages", this.streamgageLayer);
      }
    });

    // Setting local click point variable
    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickPoint = point;
    });

    // Setting local basin characteristics variable
    this._mapService.basinCharacteristics.subscribe((bc: {}) => {
      this.basinCharacteristics = bc;
    });

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
    });

    // On map zoom, set current zoom, display gages
    this._mapService.map.on('zoomend',(evt) => {
      this.currentZoom = evt.target._zoom;
      this._mapService.setCurrentZoomLevel(evt.target._zoom);
      this.setBbox();
    });

    // On map drag, display gages
    this._mapService.map.on('dragend',() => {
      this.setBbox();
    });

    // Subscribe to workflow
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflow = res;
      if (this.selectedWorkflow) {
        this.outputLayers = L.layerGroup().addTo(this._mapService.map);
        if (this.selectedWorkflow.title != "Delineation") {
          this.checkAvailableLayers();
        }
      }
      if (!this.selectedWorkflow) {
        this.removeWorkFlowLayers();
        this.removeLayer(this.outputLayers);
      }
    });

    // Subscribe to the workflow form
    this._workflowService.workflowForm.subscribe((workflowForm: any) => {
      this.workflowForm = workflowForm;
    });

    // Subscribe to the form data
    this._workflowService.formData.subscribe(async data => {
      this.workflowData = data;
      if (this.workflowData) {
        if (this.workflowData.title == "Delineation" || this.workflowData.title == "Fire Hydrology") {
          this.checkAvailableLayers();
          // If Step #2 (Select Delineation Point) in the Delineation workflow has been completed
          if (this.workflowData.title == "Delineation" && this.workflowData.steps[1].completed && !this.workflowData.steps[2].completed) {
            // Check to see what Basin Characteristics are available for this point
            await this.queryBasinCharacteristics();
            // If at least one basin characteristic is available
            // TODO: change these values from -9999.0 and -19.998 once this issue is resolved: https://code.usgs.gov/StreamStats/web-services-and-apis/cogQuery/lambdas/cq-lambda/-/issues/4
            this.basinCharacteristics = this.basinCharacteristics.filter((basinCharacteristic) => basinCharacteristic.value != -9999.0 && basinCharacteristic.value != -19.998);
            if (this.basinCharacteristics.length > 0) {
              this._mapService.setBasinCharacteristics(this.basinCharacteristics);
              let basinCharacteristicArray = [];
              this.basinCharacteristics.forEach(basinCharacteristic=> {
                basinCharacteristicArray.push(this._fb.group({
                  text: basinCharacteristic.fcpg_parameter + ": " + basinCharacteristic.description,
                  selected: false
                }));
              });
              this.workflowForm.controls.steps.controls[2].controls.options.controls = basinCharacteristicArray;
              this._workflowService.setWorkflowForm(this.workflowForm);
            } else {
              this.selectedWorkflow.steps[2].description = "No basin characteristics available at the clicked point."
              this._mapService.setBasinCharacteristics(null);
            }
          }
          if (this.workflowData.title == "Delineation" && this.workflowData.steps[2].completed) {
            // If at least one basin characteristic was selected
            if (this.workflowForm.controls.steps.controls[2].controls.options.controls.filter((checkboxBasinCharacteristic) => checkboxBasinCharacteristic.value.selected).length > 0) {
              let selectedBasinCharacteristics = this.workflowForm.controls.steps.controls[2].controls.options.controls.filter(checkboxBasinCharacteristic => checkboxBasinCharacteristic.value.selected == true);
              let selectedBasinCharacteristicCodes = selectedBasinCharacteristics.map(checkboxBasinCharacteristic => checkboxBasinCharacteristic.value.text.substr(0, checkboxBasinCharacteristic.value.text.indexOf(':')));
              this.basinCharacteristics = this.basinCharacteristics.filter((basinCharacteristic) => selectedBasinCharacteristicCodes.includes(basinCharacteristic.fcpg_parameter));
              this._mapService.setBasinCharacteristics(this.basinCharacteristics);

            } else {
              this._mapService.setBasinCharacteristics(null);
            }
          }
        }
        if (this.workflowData.title == "Fire Hydrology") {
          if (this.workflowData.steps[1]) {
            if (this.workflowData.steps[1].name === "selectFireHydroBasin" && this.workflowData.steps[2].completed) {
              this.queryBurnYear();
            }
            if (this.workflowData.steps[1].name === "selectFireHydroPerimeter"  && this.workflowData.steps[3].completed) {
              this._loaderService.showFullPageLoad();
              this.addTraceLayer(this.traceData);
            }
          }
        }
      }
      if (!this.workflowData) {
        this.removeWorkFlowLayers();
      } 
    });

    // Subscribe to loader state
    this._loaderService.loaderState.subscribe((state: boolean) => {
      this.loader = state;
    });

    // Subscribe to current step
    this._workflowService.currentStep.subscribe(step => {
      if (step) {
        this.cursor = step.cursor;
      } else {
        this.cursor = "auto";
      }
    });

    // Get selected fire perimeters
    this._mapService.selectedPerimeters.subscribe((perimeter) => {
      this.selectedPerimeter = perimeter;
      //remove old highlight
      if (this.selectedPerimeterHighlight) {
        var x_id = L.stamp(this.selectedPerimeterHighlight); // Retrieve the x layer ID
        this.outputLayers.removeLayer(x_id);
      }
      // highlighted select perimeter 
      this.selectedPerimeterHighlight = L.geoJSON(this.selectedPerimeter.Data);
      this.selectedPerimeterHighlight.setStyle({color: "#ff0000"});
      this.outputLayers.addLayer(this.selectedPerimeterHighlight);

    });

    // Load Layers
    this.loadLayers();
  }


  //   Zoom to location
  public zoomLocation(): void {
    this._mapService.zoomLocation();
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
                if (o.selected == true) {
                  if (o.text === "Query by Fire Perimeters" || o.text === "Query by Basin") {
                    if (o.text === "Query by Basin") {
                      this.addLayers('NHD Flowlines', true);
                    }
                    this.addLayers('2000-2018 Wildland Fire Perimeters', true);
                    this.addLayers('2019 Wildland Fire Perimeters', true);
                    this.addLayers('2021 Wildland Fire Perimeters', true);
                    this.addLayers('2022 Wildland Fire Perimeters', true);
                    this.addLayers('MTBS Fire Boundaries', true);
                    this.addLayers('Burn Severity', false);
                  }
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

  ////////////////////////////
  /// Delineation Workflows //
  ////////////////////////////

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
        this.outputLayers.addLayer(this.splitCatchmentLayer);
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

  public addPoint(latlng: any) {
    var RedIcon = L.divIcon({className: 'wmm-pin wmm-blue wmm-icon-noicon wmm-icon-white wmm-size-25'});
    this.removeLayer(this.marker);
    const content = '<div><b>Latitude:</b> ' + latlng.lat + '<br><b>Longitude:</b> ' + latlng.lng;
    this.marker = L.marker(latlng, {icon: RedIcon}).bindPopup(content).openPopup();
    this.outputLayers.addLayer(this.marker);
  }

  public async queryBasinCharacteristics() {
    this._loaderService.showFullPageLoad();
    this.createMessage("Checking available basin characteristics. Please wait.");
    let computedBasinCharacteristics = await this._mapService.queryPrecomputedBasinCharacteristics(this.clickPoint.lat, this.clickPoint.lng);
    this._mapService.setBasinCharacteristics(computedBasinCharacteristics);
    this.createMessage("Available basin characteristics were successfully checked.");
    this._loaderService.hideFullPageLoad();
  }

  ////////////////////////////////
  /// End Delineation Workflows //
  ////////////////////////////////

  ///////////////////////////////////////////////
  /// FireHydrology - Query by Basin Workflow ///
  ///////////////////////////////////////////////
    
  public async queryBurnYear() {
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
      await this._mapService.calculateFireStreamflowEstimates(basinFeature, basinCharacteristics);
      this.createMessage("Basin characteristics and streamflow estimates were successfully calculated.");
    } else {
      this.createMessage("Please enter valid Burn Years.", 'error');
    }
    this._loaderService.hideFullPageLoad();
  }

  public validateBurnYears(startBurnYear, endBurnYear) {
    // Check if both burn years are 4-digit numbers
    if (!/^\d{4}$/.test(startBurnYear) || !/^\d{4}$/.test(endBurnYear)) {
      return false;
    } else {
      return true;
    }
  }

  ///////////////////////////////////////////////////
  /// End FireHydrology - Query by Basin Workflow ///
  //////////////////////////////////////////////////

  /////////////////////////////////////////////////////////
  /// FireHydrology - Query by Fire Perimeters Workflow ///
  /////////////////////////////////////////////////////////
  
  public onMouseClickFireHydroQueryFirePerimeter() { 
    this._loaderService.showFullPageLoad();
    this.count = 0;
    this.numFiresInClick = 0;
    this.selectedPerimeterHighlight = null;
    this.foundFire = false;
    this.firesinClick = [];
    this.createMessage("Querying fire perimeters in click point. Please wait.");

    Object.keys(this.workflowLayers).forEach(layerName => {
      if (this.activeWorkflowLayers.find(layer => layer.name === layerName)) {
        if (this.activeWorkflowLayers.find(layer => layer.name === layerName).visible == true) {
          if (layerName === '2022 Wildland Fire Perimeters' || layerName === '2021 Wildland Fire Perimeters' || layerName === '2019 Wildland Fire Perimeters' || layerName === '2000-2018 Wildland Fire Perimeters' || layerName === 'MTBS Fire Boundaries') {
            this.workflowLayers[layerName].query().nearby(this.clickPoint, 4).returnGeometry(true)
              .run((error: any, results: any) => {
                this.findFireFeatures(error, results, layerName);
              }
            );
         } else {
            this.count ++;
            this.checkCount(this.count, 6);
          }
        } else {
          this.count ++;
          this.checkCount(this.count, 6);
        }
      }
    });
  }

  public findFireFeatures(error, results, layerName) {
    
    if (error) {
      this.createMessage('Error occurred.','error');
      this._loaderService.hideFullPageLoad();
    } else if (results && results.features.length > 0) {
      this.foundFire = true;

      if (results.features.length == 1) {
        this.createContent(layerName, results.features[0]);
        this.firesinClick.push({ 'Key': layerName, 'Data': results})
      } else { // More than 1 of the same fire perimeter in click point
        var temp = { 'crs': null, 'type': null, 'features': null }
        var index = results.features.length;
        for (let i = 0; i < index; i++) {         // need to split into seperate fire perimeters
          temp = { crs: results.crs, type: results.type, features: [results.features[i]] }
          this.createContent(layerName, temp.features[0]);
          this.firesinClick.push({ 'Key': layerName, 'Data': temp})
          temp = { 'crs': null, 'type': null, 'features': null }
        }
      }
    } 
    this.count ++;
    this.checkCount(this.count, 6);
  }

  public createContent(layerName, feat) {
    let popupcontent;
    var properties = {};
    const shownFields = {
      'INCIDENTNAME':"Incident Name",
      'COMMENTS':"Comments",
      'GISACRES':"Acres",
      'FIRE_YEAR':"Fire Year",
      'CREATEDATE':"Create Date",
      'ACRES':"Acres",
      'AGENCY':"Agency",
      'SOURCE':"Source",
      'INCIDENT':"Incident",
      'FIRE_ID':"Fire ID",
      'FIRE_NAME':"Fire Name",
      'YEAR':"Year",
      'STARTMONTH':"Start Month",
      'STARTDAY':"Start Day",
      'FIRE_TYPE':"Fire Type",					  
      'POLY_INCIDENTNAME':"Incident Name",
      'POLY_GISACRES':"Acres",
      'POLY_DATECURRENT':"Modified Date",
      'IRWIN_FIRECAUSE':"Fire Cause",
      'IRWIN_FIRECAUSEGENERAL':"Fire Cause-General",
      'IRWIN_FIREDISCOVERYDATETIME':"Fire Discovery Date Time",
      'IRWIN_FIREOUTDATETIME':"Fire Out Date Time",
      'IRWIN_UNIQUEFIREIDENTIFIER':"Unique Fire Identifier"
  };

    popupcontent = '<p hidden>' + this.numFiresInClick + '</p>'
    popupcontent += '<div class="popup-header"><b>' + layerName + '</b></div><hr>';
    if (layerName === 'MTBS Fire Boundaries') {
      let date = feat.properties.STARTMONTH + '/' + feat.properties.STARTDAY + '/' + feat.properties.YEAR;
      if (date.indexOf('undefined') > -1) date = 'N/A';
    }
    Object.keys(feat.properties).forEach(prop => {
      if (Object.keys(shownFields).indexOf(prop.toUpperCase()) > -1) {
        let label = shownFields[prop.toUpperCase()];
        let val = feat.properties[prop];
        if (prop.toLowerCase().indexOf('date') > -1) {
          val = new Date(val).toLocaleDateString();
        }
        properties[label] = val;
        popupcontent += '<b>' + label + ':</b> ' + val + '<br>';
      } 
    });
    popupcontent += '<br>'; 
    popupcontent += '<center><button class="selectFire usa-button">Select Fire</button></center>'

    this.firePerimeterLayer = L.geoJSON(feat.geometry);
    this.addBurnPoint(this.firePerimeterLayer.getBounds().getCenter(), popupcontent);
    feat.properties = properties;
    this.numFiresInClick ++;
  }


  public selectFire(text) {
    // figure out which perimeter they selected
    var regex = /(?<=\>)(\d*)(?=\<\/p>)/g;
    var result = text.match(regex)[0];
    //  select new perimeter
    this._mapService.setSelectedPerimeters(this.firesinClick[result]);
    // set trace data 
    this.traceData = this.firesinClick[result].Data;
  }

  public async addTraceLayer(data) { 
    var downstreamDist = this.workflowData.steps[2].options[0].text
    this._mapService.setDownstreamDist(downstreamDist);

      var response = await this._mapService.trace(data, downstreamDist).toPromise();

      if (response && response.features) {
        response.features.forEach((feature) => {
          if (feature.id == "flowlinesGeom") { // Only print out the flow lines
            this.traceLayer = L.geoJSON(feature.geometry);
          }
        });   
      } 
      this._mapService.setFirePerimetersLayers(this.firePerimeterLayer, this.traceLayer);
      this.outputLayers.addLayer(this.traceLayer);
      this._mapService.map.fitBounds(this.traceLayer.getBounds(), { padding: [75,75] });
      this._loaderService.hideFullPageLoad();
   
  }

  public addBurnPoint(latlng, popupcontent) {
    this.marker = L.marker(latlng).bindPopup(popupcontent, {"autoClose": false}).openPopup();
    this.outputLayers.addLayer(this.marker);
    this.marker.openPopup();
  }

  public checkCount(count, goal) {
    if (count === goal) {
      if (this.foundFire == false) {
        this.createMessage('Must select a fire perimeter.','error');
      }
        this._loaderService.hideFullPageLoad();
    }
  }
  /////////////////////////////////////////////////////////////
  /// End FireHydrology - Query by Fire Perimeters Workflow ///
  ////////////////////////////////////////////////////////////

}
