import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Workflow } from 'src/app/shared/interfaces/workflow';
import { AppService } from 'src/app/shared/services/app.service';

@Component({
  selector: 'app-report-builder',
  templateUrl: './report-builder.component.html',
  styleUrls: ['./report-builder.component.scss']
})
export class ReportBuilderComponent implements OnInit, OnDestroy {

  @Input() workflows: Array<Workflow> = [];
  @Output() selectedWorkflows = new EventEmitter<any>();
  @Input() showHideWorkflow!: boolean;
  @Output() isWorkflow = new EventEmitter<boolean>();
  @Input() showHideReportBuilder!: boolean;
  @Output() isReportBuilder = new EventEmitter<boolean>();


  constructor(private _appService: AppService) { }

  ngOnInit(): void {
  }

  addRemoveWorkflow(value: Workflow) {
    this.selectedWorkflows.emit(value);
  }
  // addRemoveWorkflow(value: string) {
  //   this.selectedWorkflows.emit(value);
  // }

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

  ngOnDestroy() {
  }

}
