import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { AppService } from 'src/app/shared/services/app.service';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-report-builder',
  templateUrl: './report-builder.component.html',
  styleUrls: ['./report-builder.component.scss']
})
export class ReportBuilderComponent implements OnInit {
  // show/hide for report builder compenent and workflow component
  public showHideReportBuilder!: boolean;
  public showHideWorkflow!: boolean;
  // Workflow Component 
  public workflows: Array<Workflow> = [];
  public selectedWorkflows: Array<Workflow> = [];


  constructor(private _appService: AppService, private _workflowService: WorkflowService ) { }

  ngOnInit(): void {
    this._appService.showReportBuilder.subscribe((resp: boolean) => {
      this.showHideReportBuilder = resp // show/hide report builder from click on Sidebar Left
    });
    this._appService.showWorkflowComponent.subscribe((resp: boolean) => {
      this.showHideWorkflow = resp // show/hide workflow component
    });
    this._workflowService.getWorkflows().subscribe((res) => {
      this.workflows = res; // get all available workflows from json file
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

  // user clicks to continue to workflow prompts, updates show/hide values
  showHideWorkflows() {
    this.showHideWorkflow = !this.showHideWorkflow;
    if (!this.showHideWorkflow) {
      this._appService.setReportBuilder(true);
      this._appService.setWorkflowComponent(false);
    } else {
      this._appService.setReportBuilder(false);
      this._appService.setWorkflowComponent(true);
    }
	}

}
