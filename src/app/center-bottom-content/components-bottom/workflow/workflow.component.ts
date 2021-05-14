import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/shared/config/config.service';
import { Config } from 'src/app/shared/interfaces/config';
import { Workflow } from 'src/app/shared/interfaces/workflow';
import { AppService } from 'src/app/shared/services/app.service';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {

  //private configSettings: Config;

  //@Input() workflows: Array<Workflow> = [];
  //public selectedWorkflow: any;

  constructor(private _appService: AppService, private _configService: ConfigService, private _workflowService: WorkflowService) { 
    //this.configSettings = this._configService.getConfiguration();
  }

  ngOnInit(): void {
    // this._workflowService.getWorkflows().subscribe((res) => {
    //   this.workflows = res;
    //   console.log(this.workflows)
    // });

    // this._workflowService.selectedWorkflow.subscribe(workflow => {
    //   this.selectedWorkflow = workflow;
    // });

  }
}
