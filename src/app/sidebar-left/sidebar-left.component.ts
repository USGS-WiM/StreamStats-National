import { Component, OnInit } from '@angular/core';
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { AppService } from '../shared/services/app.service';
import { WorkflowService } from '../shared/services/workflow.service';

@Component({
  selector: 'app-sidebar-left',
  templateUrl: './sidebar-left.component.html',
  styleUrls: ['./sidebar-left.component.scss']
})
export class SidebarLeftComponent implements OnInit {

	popout = '';
	discoverTab = '';
	showHideReport!: boolean;

	// Workflow Component 
	public workflows: Array<Workflow> = [];
	public selectedWorkflows: Array<Workflow> = [];

	title = 'StreamStats-National';

  	constructor(private _workflowService: WorkflowService, private _appService: AppService) { }

	ngOnInit(): void {
		this._workflowService.getWorkflows().subscribe((res) => {
			this.workflows = res; // get all available workflows from json file
			console.log(this.workflows)
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

	public showHideReportBuilder() {
		this.showHideReport = !this.showHideReport;
		if (!this.showHideReport) {
			this._appService.setReportBuilder(false);
		} else {
			this._appService.setWorkflowComponent(false);
			this._appService.setReportBuilder(true);
		}
	}

}
