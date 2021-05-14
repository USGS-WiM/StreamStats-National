import { Component } from '@angular/core';
import { ConfigService } from '../shared/config/config.service';
import { Config } from '../shared/interfaces/config';
import { Workflow } from '../shared/interfaces/workflow';
import { AppService } from '../shared/services/app.service';
import { WorkflowService } from '../shared/services/workflow.service';

@Component({
  selector: 'app-center-bottom-content',
  templateUrl: './center-bottom-content.component.html',
  styleUrls: ['./center-bottom-content.component.scss']
})
export class CenterBottomContentComponent {

  public showHideReportBuilder!: boolean;
  public showHideWorkflow!: boolean;

  private configSettings: Config;

  public workflows: Array<Workflow> = [];
  public selectedWorkflows: Array<Workflow> = [];

  change: any;

  constructor(
    private _workflowService: WorkflowService, 
    private _appService: AppService, 
    private _configService: ConfigService
    ) { 
    this.configSettings = this._configService.getConfiguration();
  }

  ngOnInit(): void {
    this._appService.showReportBuilder.subscribe((resp: boolean) => {
      this.showHideReportBuilder = resp
    });
    this._appService.showWorkflowComponent.subscribe((resp: boolean) => {
      this.showHideWorkflow = resp
    });
    this._workflowService.getWorkflows().subscribe((res) => {
      this.workflows = res;
    });
    this._workflowService.selectedWorkflow.subscribe((w: Array<Workflow>) => {
      this.selectedWorkflows = w;
      console.log(w)
    });
  }

  addRemoveWorkflow(selectedWorkflow: Workflow) {
    const index = this.selectedWorkflows.indexOf(selectedWorkflow);
    if(index === -1) {
      this.selectedWorkflows.push(selectedWorkflow);
    } else {
      this.selectedWorkflows.splice(index, 1)
    }
    this._workflowService.setSelectedWorkflows(this.selectedWorkflows);
  }

  ngOnDestroy() {}
}
