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
  public selectedWorkflows: Array<Workflow> = [];

  constructor(private _workflowService: WorkflowService ) { }

  ngOnInit(): void {
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

}
