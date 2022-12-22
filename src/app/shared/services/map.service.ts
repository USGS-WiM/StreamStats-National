import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Map } from 'leaflet';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';
import { Subject, throwError, BehaviorSubject, Observable } from 'rxjs';
import { AppService } from './app.service';
import { MapLayer } from '../interfaces/maplayer';
import { LoaderService } from './loader.service';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import * as messageType from '../../shared/messageType';
import {catchError} from 'rxjs/operators';
import * as esri from 'esri-leaflet';
import area from '@turf/area';
import intersect from '@turf/intersect';
import union from '@turf/union';

declare const L: any;
// import 'leaflet-compass';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    private messager: ToastrService;
    public authHeader: HttpHeaders;
    public jsonHeader: HttpHeaders
    public baseMaps: any;
    public chosenBaseLayerName: string;
    public chosenBaseLayer;
    public compass: any;
    private configSettings: Config;
    public map!: Map;
    public overlays = [];
    public overlaysSubject = [];
    public streamgageStatus: boolean;
    public activeLayers = [];
    public workflowLayers = [] as any;
    public streamgageLayer: any;
    public scale: any;
    public textBox: any;
    public zoomHome: any;
    public currentZoom: number = 4;

    constructor(private _http: HttpClient, private _configService: ConfigService, private _appService: AppService, private _loaderService: LoaderService,public toastr: ToastrService) {
        this.messager = toastr;
        
        this.authHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('auth') || '',
            'Access-Control-Allow-Origin': "*"
        });
        this.jsonHeader= new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json'  
        });

        this.configSettings = this._configService.getConfiguration();

        // Load baselayers
        this.baseMaps = new Object();
        if (this.configSettings) {
            this.configSettings.baseLayers.forEach(ml => {
                if (ml["visible"]) {
                    this.chosenBaseLayer = ml;
                    this.chosenBaseLayerName = ml["name"];
                }
                var layer = this.loadLayer(ml);
                if (layer != null) {
                    this.baseMaps[ml["name"]] = layer;
                }
            });
    
        }
        if (this.configSettings) {
            this.configSettings.overlays.forEach(ml => {
                try {
                    let options;
                    options = ml["layerOptions"];
                    options.url = ml["url"];
                    this.overlays[ml["name"]] = esri.featureLayer(options);
                    this.setOverlayLayers(ml);
                } catch (error) {
                    this.createMessage(ml["name"] + ' layer failed to load.', 'error');
                    console.error(ml["name"] + ' layer failed to load', error);
                }
            })
        }
        // Load workflow layers, feeds into map.component.ts's workflowLayers
        if (this.configSettings) {
            this.configSettings.workflowLayers.forEach(ml => {
                try {
                    let options;
                    switch (ml["type"]) {
                    case "agsDynamic":
                        options = ml["layerOptions"];
                        options.url = ml["url"];
                        this.workflowLayers[ml["name"]] = esri.dynamicMapLayer(options);
                        break;
                    case "agsFeature":
                        options = ml["layerOptions"];
                        options.url = ml["url"];
                        this.workflowLayers[ml["name"]] = esri.featureLayer(options);
                        if (this.configSettings["symbols"][ml["name"]]) { 
                        this.workflowLayers[ml["name"]].setStyle(this.configSettings["symbols"][ml["name"]]); 
                        }
                        break;
                    }
                } catch (error) {
                    this.createMessage(ml["name"] + ' layer failed to load.', 'error');
                    console.error(ml["name"] + ' layer failed to load', error);
                }
            });
        }

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
                var scaleNumber: string;
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

    // Layers section
    public AddMapLayer(ml: MapLayer) {
        // Add layer to overlays 
        if (ml["visible"]) {
            this.map.addLayer(ml.layer);
        }
    }
    private loadLayer(ml: any): L.Layer {
        return L.tileLayer(
            ml["url"],
            {attribution: ml["attribution"],
            maxZoom: ml["maxZoom"]
        });
    }
    private _baseLayer: Subject<any> = new Subject<any>();
    public SetBaselayer(layername: string) {
        // Set previous basemap visibility to false and remove from map
        if (this.chosenBaseLayerName != layername) {
            this.baseMaps[this.chosenBaseLayerName].visible = false;
            this.map.removeLayer(this.baseMaps[this.chosenBaseLayerName]);
        }
        // Set the new basemap visibility to true and add to map
        if (this.baseMaps[layername]) {
            this.baseMaps[layername].visible = true;
            this.chosenBaseLayerName = layername;
            this._baseLayer.next(this.chosenBaseLayerName);
            this.map.addLayer(this.baseMaps[layername]);
        }
    }
    public get baseLayer(): any {
        return this._baseLayer.asObservable();
    }    
    private _overlayLayers: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>([]);
    public setOverlayLayers(ml: Array<any>) {
        this.overlaysSubject.push(ml);
        this._overlayLayers.next(this.overlaysSubject);
    }
    public get overlayLayers(): Observable<Array<any>> {
        return this._overlayLayers.asObservable();
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

    // Setting current zoom level
    private _zoomLevelSubject: Subject<any> = new Subject<any>();
    public setCurrentZoomLevel(level: number) {
        this._zoomLevelSubject.next(level);
    }
    public get currentZoomLevel(): any {
        return this._zoomLevelSubject.asObservable();
    }

    // Get user map click
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
        var url = this.configSettings.GageStatsServices + "stations/Bounds?xmin="+xmin+"&xmax="+xmax+"&ymin="+ymin+"&ymax="+ymax+"&geojson=true";
        this._http.get(url, {headers: this.authHeader}).subscribe(res => {
            var streamgageLayer = res;
            this._streamgages.next(streamgageLayer);
        }, error => {
            this.createMessage("Error retrieving streamgages.", 'error');
        })
    }
    public get streamgages(): any {
        return this._streamgages.asObservable();
    }
    // Setting current streamgages layer
    private _streamgageSubject: Subject<any> = new Subject<any>();
    public setStreamgagesLayer(layer: any) {
        this.streamgageLayer = layer;
        this._streamgageSubject.next(layer);
    }
    public get streamgagesLayer(): any {
        return this._streamgageSubject.asObservable();
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
            this.createMessage("Error retrieving data.", 'error');
        })
    }
    public get waterData(): any {
        return this._waterServiceData.asObservable();
    }

    // NLDI Delineation
    private _delineationSubject: Subject<any> = new Subject<any>();
    public getUpstream(lat: any, lng: any, upstream: any) {
        const options = { headers: this.jsonHeader, observe: 'response' as 'response'};
        let url = this.configSettings.nldiBaseURL + this.configSettings.nldiSplitCatchmentURL;
        let post = {
        "inputs": [
            {
            "id": "lat",
            "value": lat,
            "type": "text/plain"
            },
            {
            "id": "lon",
            "value": lng,
            "type": "text/plain"
            },
            {
            "id": "upstream",
            "value": upstream,
            "type": "text/plain"
            }
        ]
        }
        return this._http.post(url, post, options)
        .subscribe(resp => {
            this._delineationSubject.next(resp.body);
        }, error => {
            this.createMessage("Error delineating basin.", 'error');
            this._loaderService.hideFullPageLoad();
        })
    };
    public get delineationPolygon(): any {
        return this._delineationSubject.asObservable();
    };

    // Query Geology
    public queryGeology(basinFeature: any) {
        return new Promise<any[]>(resolve => {
            let basin = basinFeature.geometry;
            let basinArea = (area(basinFeature) / 1000000);
            let geologyUnion;
            let queryString = "1=1";
            this.workflowLayers["GeologyFeatures"].query().intersects(basin).where(queryString).returnGeometry(true)
            .run((error: any, results: any) => {
                if (error) {
                    console.log("error");
                    this._loaderService.hideFullPageLoad();
                    this.createMessage('Error querying geology.', 'error')
                }
                let geology_dictionary = {};
                if (results && results.features.length > 0) {
                    if (results.features.length > 3000) {
                        // MapServer limitation: only 3000 polygons will be returned
                        this.createMessage("Warning: Geology results may be incorrect due to map server limitations.", 'error');
                    }
                    let intersectArea;
                    geologyUnion = results.features[0];
                    for (let i = 0; i < results.features.length; i++) {
                        const nextFeature = results.features[i];
                        if (nextFeature) {
                            geologyUnion = union(geologyUnion, nextFeature, {"properties" : results.features[i].properties.GENERALIZED_LITH});
                            const intersectPolygons = intersect(results.features[i], basin);
                            intersectArea = area(intersectPolygons) / 1000000;
                            if (!geology_dictionary[results.features[i].properties.GENERALIZED_LITH]) {
                                geology_dictionary[results.features[i].properties.GENERALIZED_LITH] = intersectArea;
                            } else {
                                geology_dictionary[results.features[i].properties.GENERALIZED_LITH] += intersectArea;
                            }
                        }
                    }

                    // Create array of geology results
                    var geology_results = Object.keys(geology_dictionary).map(function(key) {
                        return [key, geology_dictionary[key]];
                    });
            
                    // Sort the geology results in decreasing order
                    geology_results.sort(function(first, second) {
                        return second[1] - first[1];
                    });

                    // Format geology results
                    geology_results = geology_results.map(geology_result => 
                        [geology_result[0], geology_result[1], (geology_result[1] / basinArea * 100)]
                    );
                    resolve(geology_results);
                }
            });
        });
        
    }

    // Query Burned Area
    public queryBurnedArea(basinFeature, startBurnYear, endBurnYear) {
        return new Promise<any[]>(resolve => { 
            let basin = basinFeature.geometry;
            let basinArea = (area(basinFeature) / 1000000);
            let count = 0;
            let fireUnion;
            let intArea = 0;
            
            Object.keys(this.workflowLayers).forEach(workflowLayer => {
                let queryString;
                if (workflowLayer == "2000-2018 Wildland Fire Perimeters" || workflowLayer == "2019 Wildland Fire Perimeters" || workflowLayer == "2021 Wildland Fire Perimeters" || workflowLayer == '2022 Wildland Fire Perimeters') {
                    if (workflowLayer == "2000-2018 Wildland Fire Perimeters") {
                        // TO DO #194
                        if (startBurnYear >= (new Date()).getFullYear()) {
                            count++;
                        }
                        queryString = 'fireyear >= ' + startBurnYear.toString() + ' AND fireyear <= ' + endBurnYear.toString();
                    } else if (workflowLayer == "2019 Wildland Fire Perimeters") {
                        if (startBurnYear >= (new Date()).getFullYear()) {
                            count++;
                        }
                        queryString = 'fireyear >= ' + startBurnYear.toString() + ' AND fireyear <= ' + endBurnYear.toString();
                    } else if (workflowLayer == "2021 Wildland Fire Perimeters") {
                        if (endBurnYear < (new Date()).getFullYear()) {
                            count ++;
                        }
                        queryString = '1=1';
                    } else if (workflowLayer == "2022 Wildland Fire Perimeters") {
                        if (endBurnYear <= (new Date()).getFullYear()) {
                            count ++;
                        }
                        queryString = '1=1';
                    }
                    this.workflowLayers[workflowLayer].query().intersects(basin).where(queryString).returnGeometry(true)
                    .run((error: any, results: any) =>  {
                        if (error) {            
                            this._loaderService.hideFullPageLoad();
                            this.createMessage("Error calculating Burned Area.", 'error');
                        } 
                        if (results && results.features.length > 0) {
                            if (results.features.length > 2000) {
                                // MapServer limitation: only 2000 polygons will be returned
                                this.createMessage("Warning: Burned Area may be incorrect due to map server limitations.", 'error');
                            }
                            if (fireUnion === undefined) { fireUnion = results.features[0]; }
                            for (let i = 0; i < results.features.length; i++) {
                                const nextFeature = results.features[i];
                                if (nextFeature) {
                                    fireUnion = union(fireUnion, nextFeature);
                                }
                            }
                        }
                        count ++;
                        if (count === 2) {
                            if (fireUnion !== undefined) {
                                try {
                                    const intersectPolygons = intersect(fireUnion, basin);
                                    intArea += area(intersectPolygons) / 1000000;
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                            resolve([intArea, (intArea / basinArea * 100)]);
                        }
                    });
                }
            });
        });
    }

    // TODO: add argument to only compute selected basin characteristics
    // https://code.usgs.gov/StreamStats/web-services-and-apis/cogQuery/lambdas/cq-lambda/-/issues/1
    public async queryPrecomputedBasinCharacteristics(latitude, longitude) {
        return new Promise<any []>(async resolve => { 
            let url = this.configSettings.GridQueryService + "latitude=" + latitude + "&longitude=" + longitude;
            // Use this URL if TestWeb is offline:
            // let url = "https://hgst52v4o1.execute-api.us-east-2.amazonaws.com/cogQuery/cogQuery?latitude=" + latitude + "&longitude=" + longitude;
            await this._http.post(url, {headers: this.authHeader}).subscribe(response => {
                let parameterValues = response["results"];
                var basinParameters = JSON.parse(JSON.stringify(this.configSettings.parameters));
                basinParameters.forEach(parameter => {
                    parameter.value = parameterValues[parameter.fcpg_parameter] * parameter.multiplier;
                });
                resolve(basinParameters);
            }, error => {
                console.log(error);
                this._loaderService.hideFullPageLoad();
                this.createMessage("Error getting precomputed basin characteristic values.","error");
            })
        });
    }

    public async calculateFireStreamflowEstimates(basinFeature, basinCharacteristics) {
        let url = this.configSettings.NSSServices + "scenarios?regions=74&statisticgroups=39";
        let postBody;
        await this._http.get(url, {headers: this.authHeader}).subscribe(response => {
            postBody = response;
            let regressionRegions = postBody[0]["regressionRegions"];
            regressionRegions.forEach(regressionRegion => {
                let parameters = regressionRegion["parameters"];
                parameters.forEach(parameter => {
                switch (parameter["code"]) {
                    case "DRNAREA":
                        parameter["value"] = (area(basinFeature) / 1000000);; 
                        break;
                    case "I_30_M":
                        parameter["value"] = basinCharacteristics.filter(parameter => parameter.fcpg_parameter == "i2y30")[0]["value"];
                        break;
                    case "BRNAREA":
                        parameter["value"] = 0.0; // This needs to come from this.burnedArea but doesn't matter right now because it is only used for Level 2 or 3 equations.
                        break;
                    default:
                    parameter["value"] = 0.0;
                }
                });
            });

            let streamflowEstimates = [];
            let url = this.configSettings.NSSServices + "scenarios/Estimate";
            this._http.post(url, postBody, {headers: this.authHeader}).subscribe(response => {
                let regressionRegions = response[0]["regressionRegions"];
                regressionRegions.forEach(regressionRegion => { 
                    let result = regressionRegion["results"][0]; // Confine to the first result since we are only looking at level 1 equations.
                    streamflowEstimates.push(result);
                });
                this.setStreamflowEstimates(streamflowEstimates);
            }, error => {
                console.log(error);
                this._loaderService.hideFullPageLoad();
                this.createMessage('Error calculating streamflow estimates.', 'error')
            });
        }, error => {
            console.log(error);
            this._loaderService.hideFullPageLoad();
            this.createMessage('Error calculating streamflow estimates.', 'error')
        });
    }

    // Get basin area
    private _basinArea: Subject<any> = new Subject<any>();
    public setBasinArea(value) {
        this._basinArea.next(value);
    }
    public get basinArea(): any {
        return this._basinArea.asObservable();
    }

    // Get burn Years
    private _burnYears: Subject<any> = new Subject<any>();
    public setBurnYears(value) {
        this._burnYears.next(value);
    }
    public get burnYears(): any {
        return this._burnYears.asObservable();
    }

    // Get burned area
    private _burnedArea: Subject<any> = new Subject<any>();
    public setBurnedArea(value) {
        this._burnedArea.next(value);
    }
    public get burnedArea(): any {
        return this._burnedArea.asObservable();
    }

    // Get geology report
    private _geologyReport: Subject<any> = new Subject<any>();
    public setGeologyReport(array) {
        this._geologyReport.next(array);
    }
    public get geologyReport(): any {
        return this._geologyReport.asObservable();
    }

    // Get basin characteristics
    private _basinCharacteristics: Subject<any> = new Subject<any>();
    public setBasinCharacteristics(array) {
        this._basinCharacteristics.next(array);
    }
    public get basinCharacteristics(): any {
        return this._basinCharacteristics.asObservable();
    }

    // Get streamflow estimates
    private _streamflowEstimates: Subject<any> = new Subject<any>();
    public setStreamflowEstimates(array) {
        this._streamflowEstimates.next(array);
    }
    public get streamflowEstimates(): any {
        return this._streamflowEstimates.asObservable();
    }

    // Get downstream trace distance
    private _downstreamDist: Subject<any> = new Subject<any>();
    public setDownstreamDist(value) {
        this._downstreamDist.next(value);
    }
    public get downstreamDist(): any {
        return this._downstreamDist.asObservable();
    }

    // Query Fire Perimeters
    public trace(geojson: any, downstreamDist) {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }) };
        var data = {
            "data": geojson,
            "get_flowlines": true,
	        "downstream_dist": downstreamDist
        }

        return this._http.post<any>(this.configSettings.nldiPolygonQuery, data, httpOptions)
        .pipe(catchError((err: any) => {
            this._loaderService.hideFullPageLoad();
            this.createMessage("Error tracing fire perimeters.", 'error');
            return throwError(err);  
        }))
    }

    // Get selected Fire Perimeters layers
    private _fireLayers: Subject<any> = new Subject<any>();
    public setFireTraceLayers(firePerimeters: any, trace: any) {
        this._fireLayers.next([firePerimeters, trace]);
    }
    public get fireTraceLayers(): any {
        return this._fireLayers.asObservable();
    }
    // Get selected Fire Perimeters
    private _selectedFirePerimeter: Subject<any> = new Subject<any>();
    public setSelectedFirePerimeter(perimeter) {
        this._selectedFirePerimeter.next(perimeter);
    }
    public get selectedFirePerimeter(): any {
        return this._selectedFirePerimeter.asObservable();
    }

    private createMessage(msg: string, mType: string = messageType.INFO, title?: string, timeout?: number) {
        try {
            let options: Partial<IndividualConfig> = null;
            if (timeout) { options = { timeOut: timeout }; }
            this.messager.show(msg, title, options, mType);
        } catch (e) {
        }
    }
    
    // Set overlay visibilty including streamgages, add/remove from map
    public setOverlayLayer(layerName: string) {
        this.configSettings.overlays.forEach((overlay: any) => {
            if (overlay.name === layerName) {
                if (layerName === "Streamgages") {
                    if (overlay.visible) { // if layer is off, toggle on 
                        overlay.visible = false;
                        this.map.removeLayer(this.streamgageLayer);
                    }  else { // if layer is on, toggle off
                        overlay.visible = true;
                        this.map.addLayer(this.streamgageLayer);
                    }
                } else {
                    if (overlay.visible) { // if layer is off, toggle on 
                        overlay.visible = false;
                        this.map.removeLayer(this.overlays[layerName]);
                    }  else { // if layer is on, toggle off
                        overlay.visible = true;
                        this.map.addLayer(this.overlays[layerName]);
                    }
                }
            }
        });
    }
    // Set checkmark status of overlay layer, for streamgages
    private _streamgageLayerSubject: BehaviorSubject<any> = new BehaviorSubject(true);
    public setStreamgageLayerStatus(ele: any) {
        if (ele.nativeElement.id === "Streamgages") {
            if (ele.nativeElement.checked) {
                this.streamgageStatus = true;
                this._streamgageLayerSubject.next(this.streamgageStatus);
            } else {
                this.streamgageStatus = false;
                this._streamgageLayerSubject.next(this.streamgageStatus);
            }
        }
    }
    public get streamgageLayerStatus(): any {
        return this._streamgageLayerSubject.asObservable();
    }

    //get all active workflow layers and remove active workflow layers depending on selected workflow, toggle active workflow layers
    private _workflowLayers: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>([]);
    public setWorkflowLayers(ml: Array<any>) {
        this.activeLayers.push(ml);
        this._workflowLayers.next(this.activeLayers);
    }
    public get activeWorkflowLayers(): Observable<Array<any>> {
        return this._workflowLayers.asObservable();
    }
    public removeWorkflowLayers(layerName: string) {
        const findLayer = this.activeLayers.find(ele => ele.name === layerName);
        const index = this.activeLayers.indexOf(findLayer);
        this.activeLayers.splice(index, 1);
    }
    public toggleWorkflowLayers(layerName: string) {
        this.activeLayers.forEach(layer => {
            if (layer.name === layerName) {
                if (layer.visible) { // if layer is on, toggle off
                    layer.visible = false;
                    this.map.removeLayer(this.workflowLayers[layerName]);
                } else { // if layer is off, toggle on 
                    layer.visible = true;
                    this.map.addLayer(this.workflowLayers[layerName]);
                }
            }
        });     
    }

}
