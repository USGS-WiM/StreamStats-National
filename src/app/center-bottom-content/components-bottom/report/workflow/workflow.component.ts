import { Component, Input, OnInit } from '@angular/core';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  // component communication between center bottom and workflow component 
  @Input() workflow!: Workflow;

  constructor() { }

  ngOnInit(): void {
  }

}
