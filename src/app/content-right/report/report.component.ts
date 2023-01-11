import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {ConfigService} from 'src/app/shared/config/config.service';
import {WorkflowService} from 'src/app/shared/services/workflow.service';

@Component({selector: 'app-report', templateUrl: './report.component.html', styleUrls: ['./report.component.scss']})
export class ReportComponent implements OnInit {
    public workflowData : any;
    public reportMaps = [];
    public printMaps = [];
    public marker : L.Marker;
    public showPrintModal : boolean;
    public reportTitle : string;
    public reportComments : string;

    constructor(private _workflowService : WorkflowService, private _configService : ConfigService) {}

    ngOnInit(): void {
        this._workflowService.completedData.subscribe(data => {
            this.workflowData = data;
            if (this.workflowData.length > 0) {
                setTimeout(() => {
                    this.createReportMaps();
                }, 500);
            }
        });
    }

    ngAfterViewChecked(): void {
        if (this.reportMaps.length > 0) {
            this.reportMaps.forEach((map, index) => {
                map.invalidateSize(true);
                map.fitBounds(this.workflowData[index].outputs.layers[this.workflowData[index].outputs.layers.length - 1].getBounds());
            });
        }
    }

    public createReportMaps() {
        
        this.reportMaps.forEach(map => {
            map.remove();
        });

        this.reportMaps = [];
        var RedIcon = L.divIcon({className: 'wmm-pin wmm-blue wmm-icon-noicon wmm-icon-white wmm-size-25'});

        var configSettings = this._configService.getConfiguration();
        for (var i = 0; i < this.workflowData.length; ++ i) {
            if (this.workflowData[i].outputs.layers) {
                if (this.reportMaps[i] == undefined || this.reportMaps[i] == null) {
                    this.reportMaps[i] = L.map('reportMap' + i);
                    L.tileLayer(configSettings.baseLayers[0].url, {maxZoom: configSettings.baseLayers[0].maxZoom}).addTo(this.reportMaps[i]);
                    this.workflowData[i].outputs.layers.forEach(layer => {
                        layer.addTo(this.reportMaps[i]);
                        if (this.workflowData[i].outputs.clickPoint) {
                            this.marker = L.marker(this.workflowData[i].outputs.clickPoint, {icon: RedIcon});
                            this.reportMaps[i].addLayer(this.marker);
                        }
                    });
                }
            }
        }
    }

    public createPrintMaps() {

        this.printMaps.forEach(map => {
            map.remove();
        });

        this.printMaps = [];
        var RedIcon = L.divIcon({className: 'wmm-pin wmm-blue wmm-icon-noicon wmm-icon-white wmm-size-25'});

        setTimeout(() => {
            var configSettings = this._configService.getConfiguration();
            for (var i = 0; i < this.workflowData.length; ++ i) {
                if (this.workflowData[i].outputs.layers) {
                    if (this.printMaps[i] == undefined || this.printMaps[i] == null) {
                        this.printMaps[i] = L.map('printMap' + i).setView([
                            41.1, -98.7
                        ], 8);
                        L.tileLayer(configSettings.baseLayers[0].url, {maxZoom: configSettings.baseLayers[0].maxZoom}).addTo(this.printMaps[i]);
                        this.workflowData[i].outputs.layers.forEach(layer => {
                            layer.addTo(this.printMaps[i]);
                            this.printMaps[i].fitBounds(layer.getBounds());
                            if (this.workflowData[i].outputs.clickPoint) {
                                this.marker = L.marker(this.workflowData[i].outputs.clickPoint, {icon: RedIcon});
                                this.printMaps[i].addLayer(this.marker);
                            }
                        });
                    }
                }
            }
        }, 500);
    }

    unsortedKeys() {
        return 0;
    }

    public onPrint() {
        var newstr = document.querySelector("#reportContent").innerHTML;
        document.querySelector("#printArea").innerHTML = newstr;
        window.print();
        document.querySelector("#printArea").innerHTML = "";
    }
}
