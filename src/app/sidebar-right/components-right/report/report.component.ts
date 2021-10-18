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
  public shownFields = ['INCIDENTNAME', 'COMMENTS', 'GISACRES', 'FIRE_YEAR', 'CREATEDATE', 'ACRES', 'AGENCY', 'SOURCE', 'INCIDENT', 'FIRE_ID', 'FIRE_NAME', 'YEAR', 'STARTMONTH', 'STARTDAY', 'FIRE_TYPE'];

  constructor(private _workflowService: WorkflowService, private _configService: ConfigService) { }

  ngOnInit(): void {

    this._workflowService.completedData.subscribe(data => {
      this.workflowData = data;
    });
  }
  ngAfterViewInit(){
    var configSettings = this._configService.getConfiguration();

    var reportMap = L.map('reportMap').setView([41.1, -98.7], 8);
    L.tileLayer(configSettings.baseLayers[0].url,{ maxZoom: configSettings.baseLayers[0].maxZoom }).addTo(reportMap);
  }
}
