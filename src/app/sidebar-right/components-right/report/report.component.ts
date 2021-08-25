import { Component, Input, OnInit } from '@angular/core';
import { MapService } from 'src/app/shared/services/map.service';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  currentClick!: object;
  public selectedWorkflows: any
  constructor(private _mapService: MapService, private _workflowService: WorkflowService) { }

  ngOnInit(): void {
    this._mapService.clickPoint.subscribe((point: object) => {
			this.currentClick = point; 
		});

    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflows = res;
    });
  }

}
