import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { MapService } from 'src/app/shared/services/map.service';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

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
  public stepsCompleted: number = 0;
  public numberOfSteps: number;
  public finalStep: boolean = false;
  public clickedPoint;

  constructor(private _fb: FormBuilder, public _mapService: MapService, private _workflowService: WorkflowService) {
    this.workflowForm = this._fb.group({
      title: [],
      steps: this._fb.array([])
    })
    this.stepsArray = this.workflowForm.get('steps') as FormArray;
  }

  ngOnInit(): void {
    this.setSteps();

    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickedPoint = point;
    })
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
    return form.controls.steps.controls;
  }
  public getOptions(form: any) {
    return form.controls.options.controls;
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
    this.onFormCompletion.emit(formValue);
  }

  public radio(i) {
  }

  public text(i) {
  }

  public subscription(i) {
    switch (this.workflowForm.value.title) {
      case "Delineation":
        this.workflowForm.value.steps[i].clickPoint = this.clickedPoint;      
        this.workflowForm.value.steps[i].polygon = 'polygon';   
        break;
      case "Fire Hydrology - Query Basin":
        this.workflowForm.value.steps[i].clickPoint = this.clickedPoint;
        this.workflowForm.value.steps[i].polygon = 'polygon';   
        break;
      case "Fire Hydrology - Query Fire Perimeters":
        this.workflowForm.value.steps[i].clickPoint = this.clickedPoint;
        // this.workflowForm.value.steps[i].polygon = 'polygon';   
        break;
    }
  }

  public nextStep(step, value) {
    this.workflowForm.value.steps[step].completed = true;
    this.stepsCompleted = this.stepsCompleted + 1;
    if (this.stepsCompleted == this.numberOfSteps) {
      this.finalStep = true;
    } 
    if (value == "radio") {
      this.radio(step);
    } else if (value == "subscription") {
      this.subscription(step);
    } else if (value == "text") {
      this.text(step);
    }
  }

  public finishedWorkflow(formValue: any) {
    this._workflowService.setCompletedData(formValue);
    this._workflowService.setSelectedWorkflow(null);
    this._workflowService.setFormData(null);
  }

  public onRadioChange(option, step) {
    step.options.forEach( opt => {
      if (opt.text == option.text) {
        option.selected = true;
      } else {
        opt.selected = false;
      }
    });
  }
}
