import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParameterCodec, HttpParams } from '@angular/common/http';
import { Map } from 'leaflet';

import * as L from 'leaflet';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public map?: Map;
  public chosenBaseLayer: string;
  public baseMaps: any;
  public clickLatLng!: object;

  private jsonHeader: HttpHeaders = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
  })


  constructor(private _http: HttpClient) {
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

    }
    
    private _clickPointSubject: Subject<any> = new Subject<any>();
    public setClickPoint(obj: { lat: number; lng: number; }) {
        this._clickPointSubject.next(obj);
    }
    public get clickPoint(): any {
        return this._clickPointSubject.asObservable();
    }

    //POST - to add later in settings service to be used thorough other services/app
    // public postEntity(entity: object, url: string) {
    //     return this._http
    //     .post(url, entity, { headers: this.jsonHeader, observe: 'response' })
    //     .subscribe(res => {
    //         return res.body;
    //     })
    // }

    private _delineationSubject: Subject<any> = new Subject<any>();
    public getDelineation(entity: object) {
        const options = { headers: this.jsonHeader, observe: 'response' as 'response'}

        // to be added to config file once other issues are finished
        const nldiURL = "https://nhgf.wim.usgs.gov/processes/nldi-splitcatchment/jobs?response=document";

        // return this._http.post(nldiURL, entity, options).subscribe(resp => {
        //     console.log(resp.body)
        //     //this._delineationSubject.next(entity);
        // })
        return this._http
        .post(nldiURL, entity, options)
        .subscribe(resp => {
            //console.log(resp.body)
            this._delineationSubject.next(resp.body);
            return resp.body;
        })
    }
    public get delineationPolygon(): any {
        return this._delineationSubject.asObservable();
    }
}
