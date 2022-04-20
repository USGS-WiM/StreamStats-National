import { Component, Input } from '@angular/core';

// interfaces
import { WorkflowService } from '../shared/services/workflow.service';

@Component({
  selector: 'app-center-bottom-content',
  templateUrl: './center-bottom-content.component.html',
  styleUrls: ['./center-bottom-content.component.scss']
})
export class CenterBottomContentComponent {

  @Input() selectedWorkflow: any;

  public reportBuilderTab ='selection';
  public formData: any;

  constructor(private _workflowService: WorkflowService) { 
  }

  ngOnInit(): void {

    if (!this.selectedWorkflow) {
      this._workflowService.selectedWorkflow.subscribe((res) => {
        this.selectedWorkflow = res;
      });
    }

    this._workflowService.formData.subscribe(data => {
      this.formData = data;
    })
    
  }

  public removeWorkFlow() {
    this._workflowService.setSelectedWorkflow(null);
    this._workflowService.setFormData(null);
  }
}
