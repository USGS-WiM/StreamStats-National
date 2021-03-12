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
      center: L.latLng(40.9, -73.0),
      zoom: 9,
      minZoom: 4,
      maxZoom: 19,
      renderer: L.canvas()
    });

    // Add basemaps
    this._mapService.map.addLayer(this._mapService.baseMaps[this._mapService.chosenBaseLayer]);

    // Add scale bar
    this._mapService.scale.addTo(this._mapService.map);
  }

}
