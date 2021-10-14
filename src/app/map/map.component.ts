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
import intersect from '@turf/intersect';
import dissolve from '@turf/dissolve';
import union from '@turf/union';
import combine from '@turf/combine';
import explode from '@turf/explode';
import { start } from 'repl';


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
  constructor(public _mapService: MapService, private _configService: ConfigService, private _http:
     HttpClient, private _workflowService: WorkflowService, public toastr: ToastrService, private _loaderService: LoaderService, private _appService: AppService) { 
    this.configSettings = this._configService.getConfiguration();
    this.messager = toastr;


    this.authHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*"
    });
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
      // console.log(this.selectedWorkflow);
      // if (this.selectedWorkflow) {
      //   if (this.selectedWorkflow.title == "Delineation" && this.workflowData.steps[0].completed) { 
      //     this.onMouseClickDelineation();
      //   }
      //   if (this.selectedWorkflow.title == "Fire Hydrology - Query Basin" && this.workflowData.steps[1].completed) { 
      //     // console.group(this.workflowData);
      //     // if (this.workflowData.length == 0){
      //       // this.onMouseClickDelineation();
      //       // console.log(this.workflowData.steps[0]);
      //       // console.log(this.workflowData.steps[1].options[0].text); // start year
      //       // console.log(this.workflowData.steps[1].options[1].text); // end year
      //       // console.log(this.workflowData.steps[1][1]);
      //     // } 
      //     // else if (this.workflowData.steps[0].completed) {
      //     //   console.log(this.workflowData);
      //     // }
      //       this.onMouseClickFireHydroQueryBasin(Number(this.workflowData.steps[1].options[0].text), Number(this.workflowData.steps[1].options[1].text));
      //   }
      //   if (this.selectedWorkflow.title == "Fire Hydrology - Query Fire Perimeters" && this.workflowData.steps[0].completed) { 
          
      if (this.selectedWorkflow) {
        if (this.workflowData) {
          if (this.workflowData.title == "Delineation" && this.workflowData.steps[0].completed) { 
            this.onMouseClickDelineation();
          }
        }
        // if (this.selectedWorkflow.title == "Fire Hydrology - Query Basin") { 
        //   this.onMouseClickFireHydroQueryBasin(Number(this.workflowData.steps[1].options[0].text), Number(this.workflowData.steps[1].options[1].text));
        // }
        if (this.selectedWorkflow.title == "Fire Hydrology - Query Basin") { 
          // this.onMouseClickFireHydroQueryBasin(Number(this.workflowData.steps[1].options[0].text), Number(this.workflowData.steps[1].options[1].text));
          this.onMouseClickFireHydroQueryBasin();
        }
        if (this.selectedWorkflow.title == "Fire Hydrology - Query Fire Perimeters") { 
          this.onMouseClickFireHydroQueryFirePerimeter();
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
    this._workflowService.formData.subscribe(data => {
      this.workflowData = data;
      if (this.workflowData) {
        if (this.workflowData.title == "Delineation") {
          this.checkAvailableLayers();
        } else if (this.workflowData.title == "Fire Hydrology - Query Basin") {
          // console.log(this.workflowData);
          if (this.workflowData.steps[1].completed == true) {
            
            this._loaderService.showFullPageLoad();
            // console.log(this.workflowData.steps[1].options[0].text);
            // console.log(this.workflowData.steps[1].options[1].text);
            let startyear = this.workflowData.steps[1].options[0].text;
            let endyear = this.workflowData.steps[1].options[1].text;
            this.queryNIFC(this.basin.features[1].geometry, (area(this.basin.features[1]) / 1000000), startyear, endyear);
            this.queryGeology(this.basin.features[1].geometry, (area(this.basin.features[1]) / 1000000));
            
            // this._loaderService.hideFullPageLoad();
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
                  this.addLayers('NHD Flowlines');
                }
              });
            }
          }
          break;
        case "Fire Hydrology - Query Basin":
          this.addLayers('NHD Flowlines');
          this.addLayers('Archived WildFire Perimeters');
          this.addLayers('Active WildFire Perimeters');
          this.addLayers('MTBS Fire Boundaries');
          this.addLayers('Burn Severity');
          break;
        case "Fire Hydrology - Query Fire Perimeters":
          this.addLayers('Archived WildFire Perimeters');
          this.addLayers('Active WildFire Perimeters');
          this.addLayers('MTBS Fire Boundaries');
          this.addLayers('Burn Severity');
          break;
    }
    }

  }

  private loadLayers() {
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

  public addLayers(layerName: string) {
    this.configSettings.workflowLayers.forEach((layer: any) => {
      if (layer.name === layerName) {
        layer.visible = true;
        this._mapService.setWorkflowLayers(layer);
      }
    }); 
    this.workflowLayers[layerName].addTo(this._mapService.map);
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
      this.basin = poly.outputs;
      if (this.basin) {  
        this.removeLayer(this.splitCatchmentLayer);  
        this.splitCatchmentLayer = L.geoJSON(this.basin.features[1]);
        this.splitCatchmentLayer.addTo(this._mapService.map);
        this._mapService.map.fitBounds(this.splitCatchmentLayer.getBounds(), { padding: [75,75] });
      }
      this._loaderService.hideFullPageLoad();
    });
  }

  public onMouseClickFireHydroQueryBasin() { 
    // console.log(startyear);
    // console.log(endyear);
    this._loaderService.showFullPageLoad();
    this.createMessage("Delineating basin. Please wait.");
    this.removeLayer(this.splitCatchmentLayer);
    this.addPoint(this.clickPoint);
    this.marker.openPopup();
    this._mapService.getUpstream(this.clickPoint.lat, this.clickPoint.lng, "True");
    this._mapService.delineationPolygon.subscribe((poly: any) => {
      this.basin = poly.outputs;
      if (this.basin) {  
        this.removeLayer(this.splitCatchmentLayer);  
        this.splitCatchmentLayer = L.geoJSON(this.basin.features[1]);
        console.log("Delineated basin:");
        console.log(this.basin.features[1].geometry);
        console.log("Basin area:");
        console.log((area(this.basin.features[1]) / 1000000).toPrecision(3) + " sq mi");
        this.splitCatchmentLayer.addTo(this._mapService.map);
        this._mapService.map.fitBounds(this.splitCatchmentLayer.getBounds(), { padding: [75,75] });
        // this.queryNIFC(this.basin.features[1].geometry, (area(this.basin.features[1]) / 1000000), startyear, endyear);
        // this.queryGeology(this.basin.features[1].geometry, (area(this.basin.features[1]) / 1000000));
        this._loaderService.hideFullPageLoad();
      } else {
        this._loaderService.hideFullPageLoad();
      }
      
    });
  }

  public queryGeology(basin, basinArea) {
    this._loaderService.showFullPageLoad();
    this.createMessage("Analyzing Geology. Please wait.");
    let geologyUnion;
    let queryString = "1=1";
    var url = this.configSettings.geologyURL;
    this.workflowLayers["GeologyFeatures"].query().intersects(basin).where(queryString).returnGeometry(true)
    .run((error: any, results: any) => {
      if (error) {
        console.log("error");
      }

      let geology_dictionary = {};
      if (results && results.features.length > 0) {
        if (results.features.length > 999) {
              // issue when there are more than 1000 features returned!
            console.log("Warning: Geology results may be incorrect due to map server limitations.");
        }
        let intersectArea;
        geologyUnion = results.features[0];
        for (let i = 0; i < results.features.length; i++) {
            const nextFeature = results.features[i];
            if (nextFeature) {
              geologyUnion = union(geologyUnion, nextFeature, {"properties" : results.features[i].properties.GENERALIZED_LITH});
              const intersectPolygons = intersect(results.features[i], basin);
              intersectArea = area(intersectPolygons) / 1000000;
              if (!geology_dictionary[results.features[i].properties.GENERALIZED_LITH]) {
                geology_dictionary[results.features[i].properties.GENERALIZED_LITH] = intersectArea;
              } else {
                geology_dictionary[results.features[i].properties.GENERALIZED_LITH] += intersectArea;
              }
            }
        }

        console.log("Geology results:")
        Object.keys(geology_dictionary).forEach(function(key) {
          console.log(key + ": ");
          console.log(geology_dictionary[key].toPrecision(3) + " sq mi (" + (geology_dictionary[key] / basinArea * 100).toPrecision(3) + " %)");
        });
        
      this._loaderService.hideFullPageLoad();

        
        }
      });
      
  }

  public queryNIFC(basin, basinArea, startYear, endYear) {
    // this._loaderService.showFullPageLoad();
    this.createMessage("Calculating Burned Area. Please wait.");
    let count = 0;
    let fireUnion;
    let intArea = 0;
    Object.keys(this.workflowLayers).forEach(workflowLayer => {
      // console.log(workflowLayer);
      let queryString;
      if (workflowLayer == "Archived WildFire Perimeters" || workflowLayer == "Active WildFire Perimeters") {
        if (workflowLayer == "Archived WildFire Perimeters") {
          if (startYear >= (new Date()).getFullYear()) {
              count++;
              return;
          }
          queryString = 'FIRE_YEAR >= ' + startYear.toString() + ' AND FIRE_YEAR <= ' + endYear.toString();
        } else if (workflowLayer == "Active WildFire Perimeters") {
          if (endYear < (new Date()).getFullYear()) {
            count ++;
            return;
          }
          queryString = '1=1';
        }
        // console.log(queryString);
        // console.log(this.workflowLayers[workflowLayer].query());
        this.workflowLayers[workflowLayer].query().intersects(basin).where(queryString).returnGeometry(true)
          .run((error: any, results: any) => {
            if (error) {
                // this.messanger.clear();
                // this.sm('Error occurred, check console', 'Error');
                console.log("error");
            }
  
            if (results && results.features.length > 0) {
            // unionize response
              // console.log(results.features.length);
              if (results.features.length > 999) {
                  // issues when there are more than 1000 features returned!
                  // TODO: this isn't showing up for some reason!
                  // this.sm('Query returned limited results, burned area may be incorrect', messageType.INFO, '', 120000, true);
                console.log("Warning: Burned Area may be incorrect due to map server limitations.");
                }
              if (fireUnion === undefined) { fireUnion = results.features[0]; }
              for (let i = 0; i < results.features.length; i++) {
                  const nextFeature = results.features[i];
                  if (nextFeature) {
                      fireUnion = union(fireUnion, nextFeature);
                  }
              }
            }
            count ++;
            if (count === 2) {
                //this.MapService.addItem(fireUnion, 'fireUnion');
                if (fireUnion !== undefined) {
                    try {
                        const intersectPolygons = intersect(fireUnion, basin);
                        intArea += area(intersectPolygons) / 1000000;
                        // console.log("Intersect area: " + (area(intersectPolygons) / 1000000));
                        // L.geoJSON(intersectPolygons).ad
                        // dTo(this._mapService.map);
                        // console.log(intersectPolygons);
                        // console.log(area(intersectPolygons));
                    } catch (error) {
                        console.error(error);
                        // this.sm('Error calculating burn area', 'error', '', 120000, true);
                    }
                }
                // this.messanger.clear();
                console.log("Burned Area:")
                console.log(intArea.toPrecision(3) + " sq mi (" + Number((intArea / basinArea * 100).toPrecision(3)) + " %)");
                // popupContent += '<br><b>NIFC Burned Area in Basin:</b> ' + Number((intArea).toPrecision(3)) +
                //     ' sq km (' + Number((intArea / basinArea * 100).toPrecision(3)) + ' %)';
                // popup.setContent(popupContent);
                // popup.update();
                // this.marker.openPopup(); 
            }
        });
      }
    });
    // this._loaderService.hideFullPageLoad();
  }

  public onMouseClickFireHydroQueryFirePerimeter() { 
    this._loaderService.showFullPageLoad();
    this.count = 0;
    this.createMessage('Querying layers. Please wait.');
    Object.keys(this.workflowLayers).forEach(layerName => {
      if (layerName === 'Active WildFire Perimeters' || layerName === 'Archived WildFire Perimeters') {
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
    let selectedPerimeters = [];
    let layer;
    const shownFields = ['INCIDENTNAME', 'COMMENTS', 'GISACRES', 'FIRE_YEAR', 'CREATEDATE', 'ACRES', 'AGENCY', 'SOURCE', 'INCIDENT', 'FIRE_ID', 'FIRE_NAME', 'YEAR', 'STARTMONTH', 'STARTDAY', 'FIRE_TYPE'];
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
          layer = L.geoJSON(feat.geometry);
        } else if (layerName === 'Active WildFire Perimeters' || layerName === 'Archived WildFire Perimeters') {
          const col = layerName.indexOf('Active') > -1 ? 'yellow' : 'red';
          layer = L.geoJSON(feat.geometry, {style: {color: col}});
        }
        layer.addTo(this._mapService.map);
        this.addBurnPoint(layer.getBounds().getCenter(), popupcontent);
      });
      selectedPerimeters.push({ 'Key': layerName, 'Data': results})
      const data = await this._mapService.trace(results).toPromise();
      this.addTraceLayer(data);
    }
    this._mapService.setSelectedPerimeters(selectedPerimeters);
    this.count ++;
    this.checkCount(this.count, 3);
  }

  public addTraceLayer(data) {
    this.traceLayer = L.geoJSON(data);
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
