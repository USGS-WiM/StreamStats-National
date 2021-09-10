import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {

  @Input() workflow!: Workflow;
  @Output() onFormCompletion: EventEmitter<any> = new EventEmitter();

  public workflowForm: FormGroup;
  stepsArray!: FormArray;

  constructor(private _fb: FormBuilder) {
    this.workflowForm = this._fb.group({
      title: [],
      steps: this._fb.array([])
    })
    this.stepsArray = this.workflowForm.get('steps') as FormArray;
  }

  ngOnInit(): void {
    this.setSteps();
  }

  setTitle() {
    this.workflowForm.patchValue({
      title: this.workflow.title
    })
  }

  setSteps() {
    this.setTitle();
    this.workflow.steps.forEach(step => {
      this.stepsArray.push(this._fb.group({
        label: step.label,
        name: step.name,
        type: step.type,
        options: this.setOptions(step)
      }))
    })
  }

  getSteps(form: any) {
    return form.controls.steps.controls
  }
  getOptions(form: any) {
    return form.controls.options.controls
  }

  setOptions(step: any) {        
    let arr = new FormArray([])
    step.options?.forEach((opt:any) => {
      arr.push(this._fb.group({
        text: opt.text,
        selected: opt.selected
      })
      )
    })
    return arr; 
  }

  public onContinue(formValue: any) {
    this.onFormCompletion.emit(formValue)
  }

}
