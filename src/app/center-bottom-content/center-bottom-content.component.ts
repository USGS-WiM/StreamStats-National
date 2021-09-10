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
  public selectedWorkflows: Array<Workflow> = [];
  reportBuilderTab ='selection';
  public formDataOutputs: any[] = [];

  constructor(private _workflowService: WorkflowService) { 
  }

  ngOnInit(): void {
    this._workflowService.selectedWorkflow.subscribe((res) => {
      this.selectedWorkflows = res;
    });
  }

  addFormData(formData: any) {
    if (!this.formDataOutputs.length) {
      this.formDataOutputs.push(formData)
    } 
    else {
      const findDuplicate = this.formDataOutputs.find(ele => ele.title === formData.title)
      if (!this.formDataOutputs.includes(findDuplicate)) {
        this.formDataOutputs.push(formData);
      } else {
        const index = this.formDataOutputs.indexOf(formData);
        this.formDataOutputs.splice(index, 1, formData)
      }
    }
    this._workflowService.setFormData(this.formDataOutputs)
  }

}
