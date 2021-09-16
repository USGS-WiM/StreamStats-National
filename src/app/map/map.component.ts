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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
	public baselayers = [] as any;
  private configSettings: Config;
  private messager: ToastrService;
  public clickPoint = {};
  public currentZoom: number = 4;
  public latestDischarge: any;
	public overlays = [] as any;
  public selectedFeature: any;
  public marker!: L.Marker;
  public basin!: any;
  public splitCatchmentLayer: any;
  public fitBounds!: L.LatLngBounds;
  public selectedWorkflows: any;
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
      maxZoom: 19,
      renderer: L.canvas(),
      zoomControl: false
    });

    // Add basemap
    this._mapService.SetBaselayer(this._mapService.chosenBaseLayer);

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
      if (this.latestDischarge){
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
      console.log(this.workflowData)
      this.workflowData.forEach(workflow => {
        console.log(workflow)
        if (workflow.title == "Delineation") {
          console.log(workflow.steps)
          if(workflow.steps[0].completed){ 
          this.onMouseClickDelineation();
          }
        }
      })
    }) 
    // On map zoom, set current zoom, display gages
    this._mapService.map.on('zoomend',(evt) => {
      this.currentZoom = evt.target._zoom;
      this.addLayers();
      this.setBbox();
    }) 
    // On map drag, display gages
    this._mapService.map.on('dragend',() => {
      this.setBbox();
    })
    // Subscribe to workflow
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflows = res;
    });

    //Subscribe to the form data
    this._workflowService.formData.subscribe(data => {
      this.workflowData = data;
    });
  }

  public addLayers() {
    //Setting stream layer
    if (this.currentZoom >= 8 && this.selectedWorkflows.some(workflow=>workflow.title === 'Delineation')) { // checking current zoom and workflow
      esri.dynamicMapLayer({
        'url': 'https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer',
        'layers': [5,6]
      }).addTo(this._mapService.map);
    }
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
    this._mapService.map?.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
      console.log(evt.latlng)
      this._mapService.setClickPoint(evt.latlng)
      this.addPoint(evt.latlng);
      this.marker.openPopup();
      this.delineationLoader = true;
      this.createMessage("Delineating Basin. Please wait.");
      this._nldiService.getUpstream(evt.latlng.lat, evt.latlng.lng, "True");
    });

    this._nldiService.delineationPolygon.subscribe((poly: any) => {
      this.basin = poly.outputs;
      if (this.basin) {
        console.log('test')
        this.removeLayer(this.splitCatchmentLayer)
        this.splitCatchmentLayer = L.geoJSON(this.basin.features[1]);
        this._mapService.map?.addLayer(this.splitCatchmentLayer);
        this._mapService.map?.fitBounds(this.splitCatchmentLayer.getBounds(), { padding: [75,75] });
      }
      this.delineationLoader = false;
    });
  }

  public addPoint(latlng: any) {
    this.removeLayer(this.marker)
    const content = '<div><b>Latitude:</b> ' + latlng.lat + '<br><b>Longitude:</b> ' + latlng.lng;
    this.marker = L.marker(latlng).bindPopup(content).openPopup();
    this._mapService.map?.addLayer(this.marker)
  }

  public removeLayer(layer: any) {
    if (this._mapService.map?.hasLayer(layer)) {
      this._mapService.map?.removeLayer(layer)
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
