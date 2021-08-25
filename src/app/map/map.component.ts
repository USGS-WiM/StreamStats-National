import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MapService } from '../shared/services/map.service';
import * as L from 'leaflet';
import { Config } from 'protractor';
import { ConfigService } from '../shared/config/config.service';
import { SettingService } from '../shared/services/setting.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  private configSettings: Config;
  public clickPoint = {};
  public streamgageLayer: any;
  public currentLat: number = 41.1;
  public currentLng: number = -98.7;
  public currentZoom: number = 4;
  public latestDischarge: string = "";

  constructor(private _mapService: MapService, private _configService: ConfigService, private _settingService: SettingService, private _http: HttpClient,
    ) { 
    this.configSettings = this._configService.getConfiguration();
  }

  ngOnInit() {
    // Initialize map
    this._mapService.map = L.map('map', {
      center: L.latLng(41.1, -98.7),
      zoom: 4,
      minZoom: 4,
      maxZoom: 19,
      renderer: L.canvas(),
      layers: [this._mapService.baseMaps[this._mapService.chosenBaseLayer]]
    });

    // setting local click point variable
    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickPoint = point;
    })
    // On map click, set click point value, for delineation
    this._mapService.map.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
      this._mapService.setClickPoint(evt.latlng);
    }) 
    // On map move, set currnt lat and long
    this._mapService.map.on("mousemove",(evt: { latlng: { lat: number; lng: number; }; }) => {
      this.currentLat = evt.latlng.lat;
      this.currentLng = evt.latlng.lng;
    }) 
    // On map zoom, set current zoom, display gages
    this._mapService.map.on('zoomend',(evt) => {
      this.currentZoom = evt.target._zoom;
      if (this.streamgageLayer !== undefined) this._mapService.map.removeLayer(this.streamgageLayer);
      if (this.currentZoom >= 8) {
        var bBox = this._mapService.map.getBounds();
        var ne = bBox.getNorthEast(); // LatLng of the north-east corner
        var sw = bBox.getSouthWest(); // LatLng of the south-west corder
        this.getStreamgages(sw.lng, ne.lng, sw.lat, ne.lat)
      }
    }) 
    // On map drag, display gages
    this._mapService.map.on('dragend',() => {
      if (this.streamgageLayer !== undefined) this._mapService.map.removeLayer(this.streamgageLayer); // Remove old layer
      if (this.currentZoom >= 8) {
        var bBox = this._mapService.map.getBounds();
        var ne = bBox.getNorthEast(); // LatLng of the north-east corner
        var sw = bBox.getSouthWest(); // LatLng of the south-west corder
        this.getStreamgages(sw.lng, ne.lng, sw.lat, ne.lat);
      } 
    });
  }

  public getStreamgages(xmin: number, xmax: number, ymin: number, ymax: number) {
    var url = this.configSettings.GageStatsServices + "/stations/Bounds?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&geojson=true";
    this._settingService.getEntities(url).subscribe(sg => {
      this.streamgageLayer = sg;
      this.addGeoJSON("streamgages", this.streamgageLayer);
    }, error => {
      console.log(error);
    });
  }

  private addGeoJSON(LayerName: string, feature: any) {
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
            self.getWaterServiceData(siteNo, popup, feature);
          }
        },
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng,{icon: MyIcon});
        }
      }).addTo(this._mapService.map);
    }
  }

  public getWaterServiceData(site: number, popup:any, feature:any){
    var url = 'https://waterservices.usgs.gov/nwis/iv/?format=rdb&sites=' + site + '&parameterCd=00060&siteStatus=all'
    this._http.get(url, {responseType: 'text'}).subscribe(res => {
      res = res.split('\n').filter(function(line){ 
        return line.indexOf( "#" ) == -1;
      }).join('\n');
      const parsedString = res.split('\n').map((line) => line.split('\t'));
      if (parsedString[2][4]) {
        this.latestDischarge = parsedString[2][4] + " @ " + parsedString[2][2];
      } else this.latestDischarge = "No Data";
      // Set dynamic content for popup
      var SSgagepage = 'https://streamstatsags.cr.usgs.gov/gagepages/html/' + site + '.htm';
      var NWISpage = 'http://nwis.waterdata.usgs.gov/nwis/inventory/?site_no=' + site;
      var innerHTML =  feature.properties['Name'] + ' ('  + site + ')' + '<hr><strong>Station Type</strong>: ' + 
      feature.properties.StationType.name + '</br><strong>Discharge, cfs: </strong>' +
      this.latestDischarge + '<br><strong>NWIS page: </strong><a href="' + 
      NWISpage +' "target="_blank">link</a></br><strong>StreamStats Gage page: </strong><a href="' + 
      SSgagepage + '" target="_blank">link</a></br>';
      popup.setContent( innerHTML );
    }, error => {
     console.log(error);
   })
  }
}
