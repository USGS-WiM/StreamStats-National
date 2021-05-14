import { Component } from '@angular/core';
import { ConfigService } from '../shared/config/config.service';
import { AppService } from '../shared/services/app.service';
import { WorkflowService } from '../shared/services/workflow.service';
// interfaces
import { Config } from '../shared/interfaces/config';
import { Workflow } from '../shared/interfaces/workflow';

@Component({
  selector: 'app-center-bottom-content',
  templateUrl: './center-bottom-content.component.html',
  styleUrls: ['./center-bottom-content.component.scss']
})
export class CenterBottomContentComponent {
  // Report Builder Component 
  public showHideReportBuilder!: boolean;
  public showHideWorkflow!: boolean;
  
  // Workflow Component 
  public workflows: Array<Workflow> = [];
  public selectedWorkflows: Array<Workflow> = [];

  // Center Bottom Component
  private configSettings: Config;

  constructor(
    private _workflowService: WorkflowService, 
    private _appService: AppService, 
    private _configService: ConfigService
    ) { 
    this.configSettings = this._configService.getConfiguration();
  }

  ngOnInit(): void {
    this._appService.showReportBuilder.subscribe((resp: boolean) => {
      this.showHideReportBuilder = resp // show/hide report builder from click on Sidebar Left
    });
        this._workflowService.getWorkflows().subscribe((res) => {
      this.workflows = res; // get all available workflows from json file
    });
    this._appService.showWorkflowComponent.subscribe((resp: boolean) => {
      this.showHideWorkflow = resp // show/hide workflow component
    });
    this._workflowService.selectedWorkflow.subscribe((w: Array<Workflow>) => {
      this.selectedWorkflows = w; // get all selected workflows to be used in workflow component 
    });
  }
  // Gets all workflows that user has selected/deselected and sets selected workflow
  addRemoveWorkflow(selectedWorkflow: Workflow) {
    const index = this.selectedWorkflows.indexOf(selectedWorkflow);
    if(index === -1) {
      this.selectedWorkflows.push(selectedWorkflow);
    } else {
      this.selectedWorkflows.splice(index, 1)
    }
    this._workflowService.setSelectedWorkflows(this.selectedWorkflows);
  }

}
