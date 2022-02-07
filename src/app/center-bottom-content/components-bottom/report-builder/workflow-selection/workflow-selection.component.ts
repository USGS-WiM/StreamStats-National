import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { AppService } from 'src/app/shared/services/app.service';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-workflow-selection',
  templateUrl: './workflow-selection.component.html',
  styleUrls: ['./workflow-selection.component.scss']
})
export class WorkflowSelectionComponent implements OnInit {

  public workflows: Array<Workflow> = [];
  public selectedWorkflow: Workflow;

  constructor(private _workflowService: WorkflowService ) { }

  ngOnInit(): void {
    this._workflowService.getWorkflows().subscribe((res) => {
      this.workflows = res; // get all available workflows from json file
      console.log(this.workflows)
    });
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflow = res;
    });
  }

  // Gets the workflow the user selected
  public selectWorkflow(selectedWorkflow: Workflow) {
    this._workflowService.setSelectedWorkflow(selectedWorkflow);
  }

}
