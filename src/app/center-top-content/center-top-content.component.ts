import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';

import * as L from 'leaflet';

@Component({
  selector: 'app-center-top-content',
  templateUrl: './center-top-content.component.html',
  styleUrls: ['./center-top-content.component.scss']
})
export class CenterTopContentComponent implements OnInit {

  constructor(private _mapService: MapService) {}

  ngOnInit() {
    // Initialize map
    this._mapService.map = L.map('map', {
      zoomControl: false,
      center: L.latLng(39.83, -98.58),
      zoom: 3,
      minZoom: 3,
      maxZoom: 16,
      renderer: L.canvas()
    });

    // Add basemaps
    this._mapService.map.addLayer(this._mapService.baseMaps[this._mapService.chosenBaseLayer]);

    // Add scale bar
    this._mapService.scale.addTo(this._mapService.map);

    // Add custom zoom/home buttons
    this._mapService.zoomHome.addTo(this._mapService.map);

    // Add textbox in bottom left with map scale information
    this._mapService.textBox.addTo(this._mapService.map);

    // L.control.textbox({ position: 'bottomleft' }).addTo(map);
  }

}
