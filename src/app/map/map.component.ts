import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MapService } from '../shared/services/map.service';
import * as L from 'leaflet';
import { Config } from 'protractor';
import { ConfigService } from '../shared/config/config.service';
import { SettingService } from '../shared/services/setting.service';

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

  constructor(private _mapService: MapService, private _configService: ConfigService, private _settingService: SettingService) { 
    this.configSettings = this._configService.getConfiguration();
  }

  ngOnInit() {
    // Initialize map
     this._mapService.map = L.map('map', {
       center: L.latLng(41.1, -98.7),
       zoom: 4,
       minZoom: 4,
     maxZoom: 19,
       renderer: L.canvas()
     });

    // Add basemaps
    this._mapService.map.addLayer(this._mapService.baseMaps[this._mapService.chosenBaseLayer]);

    // setting local click point variable
    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickPoint = point;
    })
    //this.getStreamgages(-97.55, -94.67, 34.78, 35.90);

    // On map click, set click point value, for delineation
    this._mapService.map.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
      this._mapService.setClickPoint(evt.latlng)
      console.log(evt)
    }) 
    // On map move, set currnt lat and long
    this._mapService.map.on("mousemove",(evt: { latlng: { lat: number; lng: number; }; }) => {
      this.currentLat = evt.latlng.lat;
      this.currentLng = evt.latlng.lng;
    }) 
    
    // On map zoom, set current zoom, display gages

  }

  public getStreamgages(xmin: number, xmax: number, ymin: number, ymax: number) {
    var url = this.configSettings.GageStatsServices + "/stations/Bounds?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&geojson=true";
    console.log(url)
    this._settingService.getEntities(url).subscribe(sg => {
      this.streamgageLayer = sg;
      console.log(this.streamgageLayer)
    }, error => {
      console.log('error')
    });
  }

}
