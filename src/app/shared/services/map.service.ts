import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';
import { Subject } from 'rxjs';
import { AppService } from './app.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Map } from 'leaflet';
import { MapLayer } from '../interfaces/maplayer';

declare const L: any;
// import 'leaflet-compass';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    public authHeader: HttpHeaders;
    public baseMaps: any;
    public chosenBaseLayer!: string;
    public compass: any;
    private configSettings: Config;
    public locationButton: any;
    public map!: Map;
    public overlays: any;
    public scale: any;
    public textBox: any;
    public zoomHome: any;
    
    constructor(private _http: HttpClient, private _configService: ConfigService, private _appService: AppService) {
        
        this.authHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('auth') || '',
            'Access-Control-Allow-Origin': "*"
        });

        this.configSettings = this._configService.getConfiguration();

        // Load baselayers
        this.baseMaps = new Object();
        if (this.configSettings) {
            this.configSettings.baseLayers.forEach(ml => {

                if (ml["visible"]) {
                    this.chosenBaseLayer = ml["name"];
                }
                var layer = this.loadLayer(ml);
                if (layer != null) {
                    this.baseMaps[ml["name"]] = layer;
                }
            });
    
        }
        
        // TODO: Load overlay layers?
        this.overlays = new Object();

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
        
        // Compass
        // this.compass = new L.Control.Compass();

    }

    public AddMapLayer(ml: MapLayer) {

        // Add layer to overlays 
        // this.overlays[ml["name"]] = ml;

        if (ml["visible"]) {
            this.map.addLayer(ml.layer);
        }
        
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
            maxZoom: 13
        });
    }

    public SetBaselayer(layername: string) {
        
        // Set previous basemap visibility to false and remove from map
        if (this.chosenBaseLayer != layername) {
            this.baseMaps[this.chosenBaseLayer].visible = false;
            this.map.removeLayer(this.baseMaps[this.chosenBaseLayer]);
        }

        // Set the new basemap visibility to true and add to map
        if (this.baseMaps[layername]) {
            this.baseMaps[layername].visible = true;
            this.chosenBaseLayer = layername;
            this.map.addLayer(this.baseMaps[layername]);
        }
        
    }

}
