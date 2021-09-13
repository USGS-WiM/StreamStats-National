// Map-specific items: click points, adding layers, etc.

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Map } from 'leaflet';
import * as L from 'leaflet';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';
import {  Subject } from 'rxjs';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
    public map!: Map;
    public chosenBaseLayer: string;
    public baseMaps: any;
    private configSettings!: Config;
    public authHeader: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
         Authorization: localStorage.getItem('auth') || '',
         'Access-Control-Allow-Origin': "*"
      });
    
    constructor(private _http: HttpClient, private _configService: ConfigService, private _appService: AppService) {
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

        this.configSettings = this._configService.getConfiguration();
    }

    // Get user map click, used in delineation 
    // TODO: add additional functionality to be able to allow user to click multiple delineation points, future functionality
    private _clickPointSubject: Subject<any> = new Subject<any>();
    public setClickPoint(obj: { lat: number; lng: number; }) {
        this._clickPointSubject.next(obj);
    }
    public get clickPoint(): any {
        return this._clickPointSubject.asObservable();
    }

    // Get Streamgages
    private _streamgages: Subject<any> = new Subject<any>();
    public setStreamgages(xmin: number, xmax: number, ymin: number, ymax: number) {
        var url = this.configSettings.GageStatsServices + "/stations/Bounds?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&geojson=true";
        this._http.get(url, {headers: this.authHeader}).subscribe(res => {
            var streamgageLayer = res;
            this._streamgages.next(streamgageLayer);
        }, error => {
         console.log(error);
       })
    }
    public get streamgages(): any {
        return this._streamgages.asObservable();
    }

    //Get water service data - current discharge
    private _waterServiceData: Subject<any> = new Subject<any>();
    public setWaterServiceData(site: number){
        var url = 'https://waterservices.usgs.gov/nwis/iv/?format=rdb&sites=' + site + '&parameterCd=00060&siteStatus=all'
        this._http.get(url, {responseType: 'text'}).subscribe(res => {
            res = res.split('\n').filter(function(line) { 
                return line.indexOf( "#" ) == -1;
            }).join('\n');
            const parsedString = res.split('\n').map((line) => line.split('\t'));
            if (parsedString[2][4]) { this._waterServiceData.next(parsedString[2][4] + " @ " + parsedString[2][2]);
            } else this._waterServiceData.next("No Data");
        }, error => {
         console.log(error);
       })
    }
    public get waterData(): any {
        return this._waterServiceData.asObservable();
    }

 }
