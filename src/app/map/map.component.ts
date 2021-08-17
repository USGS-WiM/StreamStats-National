import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';

import * as L from 'leaflet';
import { NLDIService } from '../shared/services/nldi.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  public clickPoint!: {};
  public marker!: L.Marker;
  public basin!: any;
  public catchmentLayer!: any;
  public splitCatchmentLayer!: any;
  public fitBounds!: L.LatLngBounds;

  constructor(private _mapService: MapService, private _nldiService: NLDIService) {}

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
    });
    
    this.onMouseClick();
  }

  // On map click, set click point value, for delineation
   public onMouseClick() {
      this._mapService.map?.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
        if (this._mapService.map?.hasLayer(this.catchmentLayer)) {
          this._mapService.map?.removeLayer(this.catchmentLayer)
        }
        if (this._mapService.map?.hasLayer(this.splitCatchmentLayer)) {
          this._mapService.map?.removeLayer(this.splitCatchmentLayer)
        }
        this._mapService.setClickPoint(evt.latlng)
        this.addPoint(evt.latlng);
        this.marker.openPopup();
        //TODO: option to user to select True/False??
        this._nldiService.getSplitCatchment(evt.latlng.lat, evt.latlng.lng, "False");
      });

      this._nldiService.delineationPolygon.subscribe((poly: any) => {
        this.basin = poly.outputs;
        if (this.basin) {
          this.catchmentLayer = L.geoJSON(this.basin.features[0]);
          this.splitCatchmentLayer = L.geoJSON(this.basin.features[1]);
          this._mapService.map?.addLayer(this.catchmentLayer);
          this._mapService.map?.addLayer(this.splitCatchmentLayer);
          this._mapService.map?.fitBounds(this.catchmentLayer.getBounds(), { padding: [75,75] });
        }
      });

    };

    public addPoint(latlng: any) {
      if (this._mapService.map?.hasLayer(this.marker)) {
        this._mapService.map?.removeLayer(this.marker)
      }
      const content = '<div><b>Latitude:</b> ' + latlng.lat + '<br><b>Longitude:</b> ' + latlng.lng;
      this.marker = L.marker(latlng).bindPopup(content).openPopup();
      //this.marker = L.marker(latlng).addTo(this._mapService.map);
      //this.marker.addTo(this._mapService.map?);
      this._mapService.map?.addLayer(this.marker)
    }

}
