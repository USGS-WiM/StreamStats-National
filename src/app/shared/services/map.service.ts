import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';
import { Subject } from 'rxjs';
import { AppService } from './app.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Map } from 'leaflet';
import { MapLayer } from '../interfaces/maplayer';

declare const L: any;
// import * as L from 'leaflet';
// import 'leaflet-easybutton';
// import 'leaflet-compass';
// import * as search_api from 'usgs-search-api';
// declare const search_api: search_api;

export interface layerControl {
    baseLayers: Array<any>;
    overlays: Array<any>
}


@Injectable({
    providedIn: 'root'
})
export class MapService {
    private configSettings!: Config;
    public map!: Map;
    public chosenBaseLayer!: string;
    public baseMaps: any;
    public scale: any;
    public zoomHome: any;
    public textBox: any;
    public textbox2: any;
    public locationButton: any;
    public compass: any;
    public LayersControl: BehaviorSubject<layerControl> = new BehaviorSubject<any>({ baseLayers: [], overlays: [] });
    public authHeader: HttpHeaders;

    public _layersControl: layerControl = {
        baseLayers: [],
        overlays: []
    };
        
    private jsonHeader: HttpHeaders = new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json'
    });

    
    constructor(private _http: HttpClient, private _configService: ConfigService, private _appService: AppService) {
        
        this.authHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('auth') || '',
            'Access-Control-Allow-Origin': "*"
        });

        this.configSettings = this._configService.getConfiguration();

        // this.chosenBaseLayer = 'WorldTopographic';

        this.configSettings.baseLayers.forEach(ml => {
            if (ml["visible"]) {
                this.chosenBaseLayer = ml["name"];
            }
            var layer = this.loadLayer(ml);
            if (layer != null) {
                this._layersControl.baseLayers.push(ml);
            }
            // console.log(this._layersControl);
            this.LayersControl.next(this._layersControl);
            // console.log(ml);

            // Then load the overlay layers
        })

        this.baseMaps = {
            
            WorldTopographic: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                zIndex: 1,
                attribution:
                    'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL,' +
                    'Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                    maxZoom: 16
            }),
            NationalGeographic: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
                maxZoom: 16
            }),
            NationalMap: L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
                attribution: '<a href="https://www.doi.gov">U.S. Department of the Interior</a> | <a href="https://www.usgs.gov">U.S. Geological Survey</a>',
                maxZoom: 16,
            }),
            Streets: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
            }),
            Gray: L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                zIndex: 1,
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                maxZoom: 16
            }),
            Satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                zIndex: 1,
                attribution:
                    'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, ' +
                    'and the GIS User Community',
                maxZoom: 16
            }),
            ShadedRelief: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
                maxZoom: 16
            })
        };

        // Scalebar
        this.scale = L.control.scale();

        // Custom zoom bar control that includes a custom home button
        L.Control.zoomHome = L.Control.extend({
            options: {
                position: 'topleft',
                zoomInText: '<i style="line-height:1.5; font-size:20px;">+</i>', // Is there a better way to style the zoom in/out and home buttons?
                zoomInTitle: 'Zoom in',
                zoomOutText: '<i style="line-height:1; font-size:20px;">-</i>',
                zoomOutTitle: 'Zoom out',
                zoomHomeText: '<i class="fa fa-home" style="line-height:1.65; font-size:20px;"></i>',
                zoomHomeTitle: 'Zoom home'
            },

            onAdd: function (map: Map) {
                var controlName = 'gin-control-zoom',
                    container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                    options = this.options;

                this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
                    controlName + '-in', container, this._zoomIn);
                this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
                    controlName + '-home', container, this._zoomHome);
                this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
                    controlName + '-out', container, this._zoomOut);

                this._updateDisabled();
                map.on('zoomend zoomlevelschange', this._updateDisabled, this);

                return container;
            },

            onRemove: function (map: Map) {
                map.off('zoomend zoomlevelschange', this._updateDisabled, this);
            },

            _zoomIn: function (e: any) {
                this._map.zoomIn(e.shiftKey ? 3 : 1);
            },

            _zoomOut: function (e: any) {
                this._map.zoomOut(e.shiftKey ? 3 : 1);
            },

            _zoomHome: function (e: any) {
                this._map.setView(this._map.options.center, this._map.options.zoom);
            },

            _createButton: function (html: any, title: any, className: any, container: any, fn: any) {
                var link = L.DomUtil.create('a', className, container);
                link.innerHTML = html;
                link.href = '#';
                link.title = title;

                L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', fn, this)
                    .on(link, 'click', this._refocusOnMap, this);

                return link;
            },

            _updateDisabled: function () {
                var map = this._map,
                    className = 'leaflet-disabled';

                L.DomUtil.removeClass(this._zoomInButton, className);
                L.DomUtil.removeClass(this._zoomOutButton, className);

                if (map._zoom === map.getMinZoom()) {
                    L.DomUtil.addClass(this._zoomOutButton, className);
                }
                if (map._zoom === map.getMaxZoom()) {
                    L.DomUtil.addClass(this._zoomInButton, className);
                }
            }
        });
        this.zoomHome = new L.Control.zoomHome();

        // Textbox that describes map scale (UNFINISHED- incorrect location)

        L.Control.textBox = L.Control.extend({
            onAdd: function (map: Map) {
                var text = L.DomUtil.create('div');
                text.id = "info_text";
                var scaleNumber;
                switch (map.getZoom()) {
                    case 19: scaleNumber = '1,128'; break;
                    case 18: scaleNumber = '2,256'; break;
                    case 17: scaleNumber = '4,513'; break;
                    case 16: scaleNumber = '9,027'; break;
                    case 15: scaleNumber = '18,055'; break;
                    case 14: scaleNumber = '36,111'; break;
                    case 13: scaleNumber = '72,223'; break;
                    case 12: scaleNumber = '144,447'; break;
                    case 11: scaleNumber = '288,895'; break;
                    case 10: scaleNumber = '577,790'; break;
                    case 9: scaleNumber = '1,155,581'; break;
                    case 8: scaleNumber = '2,311,162'; break;
                    case 7: scaleNumber = '4,622,324'; break;
                    case 6: scaleNumber = '9,244,649'; break;
                    case 5: scaleNumber = '18,489,298'; break;
                    case 4: scaleNumber = '36,978,596'; break;
                    case 3: scaleNumber = '73,957,193'; break;
                    case 2: scaleNumber = '147,914,387'; break;
                    case 1: scaleNumber = '295,828,775'; break;
                    case 0: scaleNumber = '591,657,550'; break;
                }
                text.innerHTML = "<span style='border-radius:3px; background-color: rgba(255,255,255,.7); padding: 4px; margin-left: -5px;'>Map Scale: 1:" + scaleNumber + "</i>" // Can this styling be moved?
                return text;
            },

            onRemove: function (map: Map) {
                // Nothing to do here
            }
        });
        L.control.textbox = function (opts: any) { return new L.Control.textbox(opts); }
        this.textBox = new L.Control.textBox({ position: 'bottomleft' });
        
        // Button that shows your location
        // this.locationButton = L.easyButton('<i class="fa fa-crosshairs" style="line-height:1.65; font-size:16px;"></i>', function (btn: any, map: Map) { //Need to improve styling
        //     var locationMarker = new L.CircleMarker([0, 0]).addTo(map);
        //     map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true })
        //         .on('locationfound', function (e) {
        //             locationMarker.setLatLng(e.latlng);
        //             locationMarker.redraw();
        //         })
        //         .on('locationerror', function (e) {
        //             alert("Location error");
        //         })
        // });

        // Compass
        // this.compass = new L.Control.Compass();

    }

    public AddMapLayer(mlayer: MapLayer) {
        var ml = this._layersControl.overlays.find((l: any) => (l.name === mlayer.name));
    
        if (ml != null) ml.layer = mlayer.layer;
    
        else this._layersControl.overlays.push(mlayer);
    
        //Notify subscribers
        this.LayersControl.next(this._layersControl);
    }

    public zoomLocation(): void {
        var locationMarker = new L.CircleMarker([0, 0]).addTo(this.map);
        this.map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true })
            .on('locationfound', function (e) {
                locationMarker.setLatLng(e.latlng);
                locationMarker.redraw();
            })
            .on('locationerror', function (e) {
                alert("Location error");
            })
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

    private loadLayer(ml: any): L.Layer {
        return L.tileLayer(
            ml["url"],
            {attribution: ml["attribution"],
            maxZoom: 16
        });
    }

    public SetBaselayer(layername: string) {
        if (this.chosenBaseLayer != layername) {
            var ml = this._layersControl.baseLayers.find((l: any) => (l.name === this.chosenBaseLayer))
            if (!ml) return; 
            ml.visible = false;
        }
    
        var ml = this._layersControl.baseLayers.find((l: any) => (l.name === layername))
    
        if (ml.visible) { 
            ml.visible = false; 
        } else {
            ml.visible = true;
        }
        this.chosenBaseLayer = ml.name;
        this.LayersControl.next(this._layersControl);
    }

}
