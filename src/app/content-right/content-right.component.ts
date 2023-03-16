import {Component, OnInit, ViewChildren, ChangeDetectorRef} from '@angular/core';
import {WorkflowService} from '../shared/services/workflow.service';

@Component({selector: 'app-content-right', templateUrl: './content-right.component.html', styleUrls: ['./content-right.component.scss']})
export class ContentRightComponent implements OnInit {

    @ViewChildren("overlayCheckbox")overlayCheckbox : any;

    tab = 1;
    title = 'StreamStats-National';
    public selectedWorkflow : any;
    public reportBuilderTab = "selection";
    public formData : any;

    constructor(private _workflowService : WorkflowService, private changeDetector : ChangeDetectorRef) {}

    ngOnInit(): void {

        if (!this.selectedWorkflow) {
            this._workflowService.selectedWorkflow.subscribe((res) => {
                this.selectedWorkflow = res;
            });
        }

        this._workflowService.formData.subscribe(data => {
            if (this.formData && data == null) {
                this.tab = 2; // Switch to Report tab after a workflow has completed
            }
            this.formData = data;
        })

    }

    ngAfterContentChecked() : void {
        this.changeDetector.detectChanges();
    }

    public removeWorkFlow() {
        this._workflowService.setSelectedWorkflow(null);
        this._workflowService.setFormData(null);
        this.tab = 1; // Keep the tab on "Build Report" when exiting a workflow
    }

}
