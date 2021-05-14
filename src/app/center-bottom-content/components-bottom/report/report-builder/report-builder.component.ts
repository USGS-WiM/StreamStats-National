import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Workflow } from 'src/app/shared/interfaces/workflow';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-report-builder',
  templateUrl: './report-builder.component.html',
  styleUrls: ['./report-builder.component.scss']
})
export class ReportBuilderComponent implements OnInit {
  // show/hide for report builder compenent and workflow component
  @Input() showHideReportBuilder!: boolean;
  @Output() isReportBuilder = new EventEmitter<boolean>();
  @Input() showHideWorkflow!: boolean;
  @Output() isWorkflow = new EventEmitter<boolean>();

  // component communication between report builder and center bottom
  @Input() workflows: Array<Workflow> = [];
  @Output() selectedWorkflows = new EventEmitter<any>();

  constructor(private _appService: AppService) { }

  ngOnInit(): void {
  }
  // On click, user able to add/remove workflow from selected workflows, communicated to center bottom component
  addRemoveWorkflow(value: Workflow) {
    this.selectedWorkflows.emit(value);
  }
  // user clicks to continue to workflow prompts, updates show/hide values
  showHideWorkflows() {
    this.showHideWorkflow = !this.showHideWorkflow;
    if (!this.showHideWorkflow) {
      this._appService.setReportBuilder(true);
      this.isReportBuilder.emit(this.showHideReportBuilder)
      this._appService.setWorkflowComponent(false);
      this.isWorkflow.emit(this.showHideWorkflow);
    } else {
      this._appService.setReportBuilder(false);
      this.isReportBuilder.emit(this.showHideReportBuilder)
      this._appService.setWorkflowComponent(true);
      this.isWorkflow.emit(this.showHideWorkflow);
    }
	}

}
