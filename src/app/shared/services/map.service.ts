import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParameterCodec, HttpParams } from '@angular/common/http';
import { Map } from 'leaflet';

import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public map?: Map;
  public chosenBaseLayer: string;
  public baseMaps: any;
  public scale: any;


  constructor() {
      this.chosenBaseLayer = 'Topo';

      this.baseMaps = {
          // {s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
          OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 20,
              zIndex: 1,
              attribution:
                  'Imagery from <a href="https://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a>' +
                      '&mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }),
          Topo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
              zIndex: 1,
              attribution:
                  'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL,' +
                      'Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          }),
          CartoDB: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
              zIndex: 1,
              attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; ' +
                      '<a href="https://cartodb.com/attributions">CartoDB</a>'
          }),
          Satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              zIndex: 1,
              attribution:
                  'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, ' +
                      'and the GIS User Community'
              // maxZoom: 10
          }),
          Terrain: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
              zIndex: 1,
              attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
              maxZoom: 13
          }),
          Gray: L.tileLayer(
              'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
              {
                  zIndex: 1,
                  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                  maxZoom: 16
              }
          )
      };

      this.scale = L.control.scale();

    }
}
