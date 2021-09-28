import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';
import * as L from 'leaflet';
import { Config } from 'protractor';
import { ConfigService } from '../shared/config/config.service';
import { HttpClient } from '@angular/common/http';
import { NLDIService } from '../shared/services/nldi.service';
import { WorkflowService } from '../shared/services/workflow.service';
import "leaflet/dist/images/marker-shadow.png";
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import * as messageType from '../shared/messageType';
import * as esri from 'esri-leaflet';
import { Workflow } from '../shared/interfaces/workflow/workflow';

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
	public baselayers = [] as any;
  private configSettings: Config;
  private messager: ToastrService;
  public clickPoint;
  public currentZoom: number = 4;
  public latestDischarge: any;
	public workflowLayers = [] as any;
  public selectedFeature: any;
  public marker: L.Marker;
  public basin: any;
  public splitCatchmentLayer: any;
  public fitBounds: L.LatLngBounds;
  public selectedWorkflow: Workflow;
  public delineationLoader: boolean = false;
  public selectedPopup: any;
  public selectedSite: any
  public streamgageLayer: any;
  public workflowData: any;
  
  constructor(public _mapService: MapService, private _configService: ConfigService, private _http:
     HttpClient, private _nldiService: NLDIService, private _workflowService: WorkflowService, public toastr: ToastrService) { 
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
    // On map click, set click point value, for delineation
    this._mapService.map.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
      this._mapService.setClickPoint(evt.latlng);
      // console.log(this.selectedWorkflow);
      if (this.selectedWorkflow) {
        if (this.selectedWorkflow.title == "Delineation" && this.workflowData.steps[0].completed) { 
          this.onMouseClickDelineation();
        }
        if (this.selectedWorkflow.title == "Fire Hydrology - Query Basin" && this.workflowData.steps[1].completed) { 
          // console.group(this.workflowData);
          // if (this.workflowData.length == 0){
            // this.onMouseClickDelineation();
            // console.log(this.workflowData.steps[0]);
            // console.log(this.workflowData.steps[1].options[0].text); // start year
            // console.log(this.workflowData.steps[1].options[1].text); // end year
            // console.log(this.workflowData.steps[1][1]);
          // } 
          // else if (this.workflowData.steps[0].completed) {
          //   console.log(this.workflowData);
          // }
            this.onMouseClickFireHydroQueryBasin(Number(this.workflowData.steps[1].options[0].text), Number(this.workflowData.steps[1].options[1].text));
        }
        if (this.selectedWorkflow.title == "Fire Hydrology - Query Fire Perimeters" && this.workflowData.steps[0].completed) { 
          
        }
      }
    }) 
    // On map zoom, set current zoom, display gages
    this._mapService.map.on('zoomend',(evt) => {
      this.currentZoom = evt.target._zoom;
      this.setBbox();
      this.checkAvailableLayers();
    }) 
    // On map drag, display gages
    this._mapService.map.on('dragend',() => {
      this.setBbox();
    })
    // Subscribe to workflow
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflow = res;
      this.checkAvailableLayers();
      if (!this.selectedWorkflow){
        this.workflowLayers.forEach(layerName => {
          this.removeLayer(this.workflowLayers[layerName]); // No workflow is selected; remove all workflow overlayers
        });

      }
    });

    //Subscribe to the form data
    this._workflowService.formData.subscribe(data => {
      this.workflowData = data;
      this.checkAvailableLayers();
      if (!this.workflowData) {
        this.workflowLayers.forEach(layerName => {
          this.removeLayer(this.workflowLayers[layerName]); // No workflow is selected; remove all workflow overlayers
        });
      } 
    });

    this.loadLayers();
  }

  public checkAvailableLayers(){
    if (this.selectedWorkflow) {
      // console.log(this.selectedWorkflow.title);
      switch (this.selectedWorkflow.title) {
        case "Delineation":
          if (this.workflowData) {
            this.workflowData.steps[0].options.forEach(o => {
              if (o.text == "NLDI Delineation" && o.selected == true) {
                this.addLayers('NHD');
              }
            });
          }
          break;
        case "Fire Hydrology - Query Basin":
          this.addLayers('NHD');
          this.addLayers('Archived WildFire Perimeters');
          this.addLayers('Active WildFire Perimeters');
          // this.addLayers('MTBS Fire Boundaries'); //TODO add back
          // this.addLayers('Burn Severity'); //TODO add back
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
        switch (ml.type) {
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
        console.error(ml.name + ' layer failed to load', error);
      }
    });
  }

  public addLayers(layerName: string) {
    this.workflowLayers[layerName].addTo(this._mapService.map);
  }

  public setBbox(){
    if (this.streamgageLayer !== undefined) this._mapService.map.removeLayer(this.streamgageLayer);
    if (this.currentZoom >= 8) {
      var bBox = this._mapService.map.getBounds();
      var ne = bBox.getNorthEast(); // LatLng of the north-east corner
      var sw = bBox.getSouthWest(); // LatLng of the south-west corder
      this._mapService.setStreamgages(sw.lng, ne.lng, sw.lat, ne.lat)
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
    this.delineationLoader = true;
    this.createMessage("Delineating Basin. Please wait.");
    this._nldiService.getUpstream(this.clickPoint.lat, this.clickPoint.lng, "True");
    this._nldiService.delineationPolygon.subscribe((poly: any) => {
      this.basin = poly.outputs;
      if (this.basin) {  
        this.removeLayer(this.splitCatchmentLayer);  
        this.splitCatchmentLayer = L.geoJSON(this.basin.features[1]);
        this.splitCatchmentLayer.addTo(this._mapService.map);
        this._mapService.map.fitBounds(this.splitCatchmentLayer.getBounds(), { padding: [75,75] });
      }
      this.delineationLoader = false;
    });
  }

  public onMouseClickFireHydroQueryBasin(startyear: Number, endyear: Number) { 
    console.log(startyear);
    console.log(endyear);
    // Issue #57: see onMouseClickDelineation() to start
    this.addPoint(this.clickPoint);
    this.marker.openPopup();
    this.delineationLoader = true;
    this.createMessage("Delineating Basin. Please wait.");
    this._nldiService.getUpstream(this.clickPoint.lat, this.clickPoint.lng, "True");
    this._nldiService.delineationPolygon.subscribe((poly: any) => {
      this.basin = poly.outputs;
      if (this.basin) {  
        this.removeLayer(this.splitCatchmentLayer);  
        this.splitCatchmentLayer = L.geoJSON(this.basin.features[1]);
        console.log(this.basin.features[1].geometry);
        console.log(area(this.basin.features[1]));
        this.splitCatchmentLayer.addTo(this._mapService.map);
        this._mapService.map.fitBounds(this.splitCatchmentLayer.getBounds(), { padding: [75,75] });
        this.queryNIFC(this.basin.features[1].geometry, (area(this.basin.features[1]) / 1000000), startyear, endyear);
      }
      this.delineationLoader = false;
    });
  }

  public queryNIFC(basin, basinArea, startYear, endYear) {
    let count = 0;
    let fireUnion;
    let intArea = 0;
    Object.keys(this.workflowLayers).forEach(workflowLayer => {
      console.log(workflowLayer);
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
        console.log(queryString);
        console.log(this.workflowLayers[workflowLayer].query());
        this.workflowLayers[workflowLayer].query().intersects(basin).where(queryString).returnGeometry(true)
          .run((error: any, results: any) => {
            if (error) {
                // this.messanger.clear();
                // this.sm('Error occurred, check console', 'Error');
                console.log("error");
            }
  
            if (results && results.features.length > 0) {
            // unionize response
              console.log(results.features.length);
              if (results.features.length > 999) {
                  // issues when there are more than 1000 features returned!
                  // TODO: this isn't showing up for some reason!
                  // this.sm('Query returned limited results, burned area may be incorrect', messageType.INFO, '', 120000, true);
                console.log("1000 features");
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
                        console.log("Intersect area: " + (area(intersectPolygons) / 1000000));
                        // L.geoJSON(intersectPolygons).ad
                        // dTo(this._mapService.map);
                        console.log(intersectPolygons);
                        console.log(area(intersectPolygons));
                    } catch (error) {
                        console.error(error);
                        // this.sm('Error calculating burn area', 'error', '', 120000, true);
                    }
                }
                // this.messanger.clear();
                console.log(Number((intArea / basinArea * 100).toPrecision(3)));
                // popupContent += '<br><b>NIFC Burned Area in Basin:</b> ' + Number((intArea).toPrecision(3)) +
                //     ' sq km (' + Number((intArea / basinArea * 100).toPrecision(3)) + ' %)';
                // popup.setContent(popupContent);
                // popup.update();
                // this.marker.openPopup(); 
            }
        });
      }
      
    });
  }

  public onMouseClickFireHydroQueryFirePerimeter() { 
    // Issue #58: see demo app for pointers
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
      let options: Partial<IndividualConfig> = undefined;
      if (timeout) { options = { timeOut: timeout }; }
      this.messager.show(msg, title, options, mType);
    } catch (e) {
    }
  }
}
