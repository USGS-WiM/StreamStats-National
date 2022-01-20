import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ConfigService } from 'src/app/shared/config/config.service';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  public workflowData: any;
  public shownFields = ['INCIDENTNAME', 'COMMENTS', 'GISACRES', 'FIRE_YEAR', 'CREATEDATE', 'ACRES', 'AGENCY', 'SOURCE', 'INCIDENT', 'FIRE_ID', 'FIRE_NAME', 'YEAR', 'STARTMONTH', 'STARTDAY', 'FIRE_TYPE', 
  'POLY_INCIDENTNAME','POLY_GISACRES', 'POLY_DATECURRENT', 'IRWIN_FIRECAUSE', 'IRWIN_FIRECAUSEGENERAL', 'IRWIN_FIREDISCOVERYDATETIME','IRWIN_FIREOUTDATETIME','IRWIN_UNIQUEFIREIDENTIFIER'];
  public reportMaps = [];
  public marker: L.Marker;

  constructor(private _workflowService: WorkflowService, private _configService: ConfigService) { }
  ngOnInit(): void {
    this._workflowService.completedData.subscribe(data => {
      this.workflowData = data;
    });
  }

  ngAfterViewChecked() {
    var configSettings = this._configService.getConfiguration();
    for (var i = 0; i < this.workflowData.length; ++i) {
      if (this.workflowData[i].outputs.layers) {
        if (this.reportMaps[i] == undefined || this.reportMaps[i] == null) {
          this.reportMaps[i] = L.map('reportMap' + i).setView([41.1, -98.7], 8);
          L.tileLayer(configSettings.baseLayers[0].url,{ maxZoom: configSettings.baseLayers[0].maxZoom }).addTo(this.reportMaps[i]);
          this.workflowData[i].outputs.layers.forEach(layer => {
            layer.addTo(this.reportMaps[i]);
            this.reportMaps[i].fitBounds(layer.getBounds());
            if (this.workflowData[i].outputs.clickPoint) {
              this.marker = L.marker(this.workflowData[i].outputs.clickPoint);
              this.reportMaps[i].addLayer(this.marker);
            }
          });
        }
      }
    }
  }

  unsortedKeys() {
    return 0;
  }
}
