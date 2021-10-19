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
  public selectedPerimeters;

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

    this._mapService.selectedPerimeters.subscribe((perimeters) => {
      this.selectedPerimeters = perimeters;
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

  public addSteps(optionSelection: string, step: any) {
    // If prior selection was made on a nested step workflow, 
    // keep only that step then overwrite the other steps.
    let stepIndex = this.stepsArray.value.indexOf(step);
    const primaryStep = this.stepsArray.at(stepIndex);
    this.stepsArray.clear();
    this.stepsArray.push(primaryStep);
    this.stepsCompleted = 0; // reset steps completed counter

    //Add nested steps depending on prior step selection
    this.workflow.steps.forEach(step => {
      step.options?.forEach(opt => {
        if (opt.text === optionSelection) {
          opt.nestedSteps.forEach(s => {
            this.stepsArray.push(this._fb.group({
              label: s.label,
              name: s.name,
              type: s.type,
              options: this.setOptions(s)
            }))
          })
        }
      })
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
      case "Fire Hydrology":
        if (this.workflowForm.value.steps[i].name === "selectFireHydroBasin") {
          this.workflowForm.value.steps[i].clickPoint = this.clickedPoint;
          this.workflowForm.value.steps[i].polygon = 'polygon'; 
        }
        if (this.workflowForm.value.steps[i].name === "selectFireHydroPerimeter") {
          this.workflowForm.value.steps[i].clickPoint = this.clickedPoint;
          this.workflowForm.value.steps[i].selectedPerimeters = this.selectedPerimeters;  
        }
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

        // TODO: Update this once delineation has more routes/branches/paths to take with in the workflow
        // such as State-Based Delineation or Open-Source Delineation. Or other future workflows. 
        if (step.name === "selectFireHydroProcess") {
          this.addSteps(opt.text, step)
        }
      } else {
        opt.selected = false;
      }
    });
  }
}
