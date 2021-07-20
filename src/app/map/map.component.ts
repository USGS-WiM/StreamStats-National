import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MapService } from '../shared/services/map.service';

import * as L from 'leaflet';
import { AppService } from '../shared/services/app.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  public clickPoint = {};

  constructor(private _mapService: MapService) { }

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
  }
  // On map click, set click point value, for delineation
  public onMouseClick() {
    this._mapService.map.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
      this._mapService.setClickPoint(evt.latlng)
    }) 
  
  };

}
