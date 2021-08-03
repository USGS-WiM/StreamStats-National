import { Component, Input } from '@angular/core';

// interfaces
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { WorkflowService } from '../shared/services/workflow.service';

@Component({
  selector: 'app-center-bottom-content',
  templateUrl: './center-bottom-content.component.html',
  styleUrls: ['./center-bottom-content.component.scss']
})
export class CenterBottomContentComponent {
  public selectedWorkflows: Array<Workflow> = [];
  reportBuilderTab ='selection';

  constructor(private _workflowService: WorkflowService) { 
  }

  ngOnInit(): void {
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflows = res;
      console.log(res)
    });
  }
}
