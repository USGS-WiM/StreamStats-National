import {Component, OnInit, ViewChildren} from '@angular/core';
import {MapService} from 'src/app/shared/services/map.service';
declare let search_api: any;
import * as L from 'leaflet';
import {ConfigService} from '../shared/config/config.service';
import {Config} from '../shared/interfaces/config/config';
import {WorkflowService} from '../shared/services/workflow.service';
// import { ConsoleReporter } from 'jasmine';

@Component({selector: 'app-content-right', templateUrl: './content-right.component.html', styleUrls: ['./content-right.component.scss']})
export class ContentRightComponent implements OnInit {

    @ViewChildren("overlayCheckbox")overlayCheckbox : any;

    tab = 1;
    title = 'StreamStats-National';
    public selectedWorkflow : any;
    public reportBuilderTab = "selection";
    public formData : any;

    constructor(private _workflowService : WorkflowService) {}

    ngOnInit(): void {

        if (!this.selectedWorkflow) {
            this._workflowService.selectedWorkflow.subscribe((res) => {
                this.selectedWorkflow = res;
            });
        }

        this._workflowService.formData.subscribe(data => {
            this.formData = data;
        })

        // Get current workflow
        // this._workflowService.selectedWorkflow.subscribe(res => {
        // this.selectedWorkflow = res;
        // })

    }

    public removeWorkFlow() {
        this._workflowService.setSelectedWorkflow(null);
        this._workflowService.setFormData(null);
    }

}
