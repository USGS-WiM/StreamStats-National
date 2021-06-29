import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';

import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  public clickPoint!: {};
  public marker!: L.Marker;
  public basin!: any[];
  public splitCatchment!: [];
  public catchment!: [];
  public catchmentPoly!: L.Polygon;
  public splitcatchPoly!: L.Polygon;
  public fitBounds!: L.LatLngBounds;

  constructor(private _mapService: MapService) {}

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
    this.onMouseClick();
    // setting local click point variable
    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickPoint = point;
    });
    // this._mapService.delineationPolygon.subscribe((poly: {}) => {
    //   this.basin = poly;
    //   console.log(this.basin)
    // });
  }
    // On map click, set click point value, for delineation
    public onMouseClick() {
      this._mapService.map?.on("click", (evt: { latlng: { lat: number; lng: number; }; }) => {
        this._mapService.setClickPoint(evt.latlng)
        //console.log(evt.latlng)
        const entity = {
          "inputs": [
            {
                "id": "lat",
                "type": "text/plain",
                "value": evt.latlng.lat
            },
            {
                "id": "lng",
                "type": "text/plain",
                "value": evt.latlng.lng
            },
            {
                "id": "upstream",
                "type": "text/plain",
                "value": "False"
            }
          ]
        };
        //console.log(entity)
        this.addPoint(evt.latlng);
        this.marker.openPopup();
        return this._mapService.getDelineation(entity);
      });
      this._mapService.delineationPolygon.subscribe((poly: {}) => {
        this.basin = Object.values(poly);
        if (this.basin) {
          console.log(this.basin)
          console.log(this.basin[0])
          this.catchment = this.basin[0][0].value.features[0].geometry.coordinates;
          console.log(this.catchment)
          this.splitCatchment = this.basin[0][0].value.features[1].geometry.coordinates;
          console.log(this.splitCatchment)
          this.catchmentPoly = L.polygon(this.catchment);
          this.splitcatchPoly = L.polygon(this.splitCatchment);
          //const layer = L.geoJSON().addTo(this._mapService.map?);
          //L.geoJSON(this.basin[0][0].value).addTo(this._mapService.map)
          //this._mapService.map?.addLayer(this.catchmentPoly)
          this._mapService.map?.addLayer(this.splitcatchPoly)
          console.log(this.splitcatchPoly)
          //const test = L.geoJSON(this.basin[0][0].value);
          //const bounds = this.splitcatchPoly.getBounds();
          //console.log(bounds)
          this._mapService.map?.addLayer(this.catchmentPoly);
  
        }
      });
      //console.log(this.basin)

      //this.catchment.push(this.basin.)
      //const basinPoly = L.polygon()

      //add point marker
      
      // add geojson/polygon

      //this._mapService.getDelineation()
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
