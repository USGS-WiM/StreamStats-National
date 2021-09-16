import { ConditionalExpr } from '@angular/compiler';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { NLDIService } from 'src/app/shared/services/nldi.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {

  @Input() workflow!: Workflow;
  @Output() onFormCompletion: EventEmitter<any> = new EventEmitter();

  public workflowForm: FormGroup;
  public stepsArray: FormArray;
  public stepCounter: number = 0;
  public stepsCompleted: number = 0;
  public numberOfSteps: number;
  public finalStep: boolean = false;
  public checkboxsSelected = [];
  public delineationPolygon;

  constructor(private _fb: FormBuilder, private _nldiService: NLDIService) {
    this.workflowForm = this._fb.group({
      title: [],
      steps: this._fb.array([])
    })
    this.stepsArray = this.workflowForm.get('steps') as FormArray;
  }

  ngOnInit(): void {
    this.setSteps();

    this._nldiService.delineationPolygon.subscribe(data => {
      this.delineationPolygon = data;
      this.nextStep(this.stepsCompleted, "subscription")
    });
  }

  public setTitle() {
    this.workflowForm.patchValue({
      title: this.workflow.title
    })
  }

  public setSteps() {
    this.setTitle();
    this.workflow.steps.forEach(step => {
      this.stepsArray.push(this._fb.group({
        label: step.label,
        name: step.name,
        type: step.type,
        options: this.setOptions(step)
      }))
    })
    this.numberOfSteps = this.stepsArray.value.length;
  }

  public getSteps(form: any) {
    return form.controls.steps.controls
  }
  public getOptions(form: any) {
    return form.controls.options.controls
  }

  public setOptions(step: any) {        
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

  public checkbox(i) {
    console.log(this.workflowForm.value)
    this.checkboxsSelected = [];
    if (this.workflowForm.value.title == "Delineation") {
      this.workflowForm.value.steps[i].options.forEach(options => {
        if (options.selected == true) {
          this.checkboxsSelected.push(options)
        }
      });
      this.checkboxsSelected.forEach(checkbox => {
        if (checkbox.text == "NLDI Delineation"){
          console.log('Now make delination and streamgage layer active')
        } // add NLDI Delineation and State-Based Delineation
      })
    } 
  }

  public text(i) {
    console.log(this.workflowForm.value)
  }

  public subscription(i) {
    console.log(this.workflowForm.value)

    if (this.workflowForm.value.title == "Delineation") {
      console.log(this.workflowForm.value.steps[i])
      this.workflowForm.value.steps[i].clickPoint = [this.delineationPolygon.latitude, this.delineationPolygon.longitude] ;
    } 
  }

  public nextStep(step, value) {
    this.workflowForm.value.steps[step].completed = true;
    this.stepsCompleted = this.stepsCompleted + 1;
    if (this.stepsCompleted == this.numberOfSteps) {
      this.finalStep = true;
      console.log('workflow completed')
    }
    if (value == "checkbox"){
      this.checkbox(step)
    } else if (value == "subscription"){
      this.subscription(step);
    } else if (value == "text"){
      this.text(step);
    }
  }
}
