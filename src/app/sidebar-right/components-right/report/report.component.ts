import { Component, OnInit } from '@angular/core';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  public workflowData: any;

  constructor(private _workflowService: WorkflowService) { }

  ngOnInit(): void {
    this._workflowService.completedData.subscribe(data => {
      this.workflowData = data;
      console.log(data)
    });
  }

}
