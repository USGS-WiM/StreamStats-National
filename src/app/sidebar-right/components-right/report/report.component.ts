import { Component, OnInit } from '@angular/core';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  public workflowData: any;
  public shownFields = ['INCIDENTNAME', 'COMMENTS', 'GISACRES', 'FIRE_YEAR', 'CREATEDATE', 'ACRES', 'AGENCY', 'SOURCE', 'INCIDENT', 'FIRE_ID', 'FIRE_NAME', 'YEAR', 'STARTMONTH', 'STARTDAY', 'FIRE_TYPE'];

  constructor(private _workflowService: WorkflowService) { }

  ngOnInit(): void {
    this._workflowService.completedData.subscribe(data => {
      this.workflowData = data;
      console.log(this.workflowData)
    });
  }
}
