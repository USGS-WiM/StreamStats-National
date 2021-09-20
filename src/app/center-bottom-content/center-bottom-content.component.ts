import { Component } from '@angular/core';

// interfaces
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { WorkflowService } from '../shared/services/workflow.service';

@Component({
  selector: 'app-center-bottom-content',
  templateUrl: './center-bottom-content.component.html',
  styleUrls: ['./center-bottom-content.component.scss']
})
export class CenterBottomContentComponent {
  public selectedWorkflow: Workflow = null;
  public reportBuilderTab ='selection';
  public formDataOutputs: any[] = [];

  constructor(private _workflowService: WorkflowService) { 
  }

  ngOnInit(): void {
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflow = res;
    });
  }

  public addFormData(formData: any) {
    this.formDataOutputs.push(formData)
  }

  public removeWorkFlow() {
    this._workflowService.setSelectedWorkflows(null)
  }
}
