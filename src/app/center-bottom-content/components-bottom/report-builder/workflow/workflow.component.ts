import { Component, Input, OnInit, Output, EventEmitter, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import * as L from 'leaflet';
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
  @Input() formData: any;

  public workflowForm: FormGroup;
  public stepsArray: FormArray;
  public stepsCompleted: number = 0;
  public numberOfSteps: number;
  public finalStep: boolean = false;
  public clickedPoint;
  public selectedPerimeters;
  public splitCatchmentLayer;
  public firePerimetersLayers;
  public output:any = {};
  public geologyReport;

  constructor(private _fb: FormBuilder, public _mapService: MapService, private _workflowService: WorkflowService) {
    this.workflowForm = this._fb.group({
      title: [],
      steps: this._fb.array([]),
      outputs: []
    })
    this.stepsArray = this.workflowForm.get('steps') as FormArray;
  }

  ngOnInit(): void {

    if (this.formData === null) {
      //Set steps if there is no prior form data
      this.setSteps();
    } else {
      //Set step and set values of prior form data
      this.populateForm();
    }

    //Get clicked point
    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickedPoint = point;
    });
    //Get geology results
    this._mapService.geologyReport.subscribe((geologyReport) => {
      this.geologyReport = geologyReport;
    });
    //Get selected fire perimeters
    this._mapService.selectedPerimeters.subscribe((perimeters) => {
      this.selectedPerimeters = perimeters;
    });
    //Get selected fire perimeter layer
    this._mapService.firePerimetersLayers.subscribe((layers) => {
      this.firePerimetersLayers = layers;
    });
    //Get delineation
    this._mapService.delineationPolygon.subscribe((poly: any) => {
      var basin = poly.outputs;
      if (basin) {  
        this.splitCatchmentLayer = L.geoJSON(basin.features[1]);
      }
    });
  }

  public setTitle() {
    this.workflowForm.patchValue({
      title: this.workflow.title
    });
  }

  public setSteps() {
    this.setTitle();
    this.workflow.steps.forEach(step => {
      this.stepsArray.push(this._fb.group({
        label: step.label,
        name: step.name,
        type: step.type,
        completed: [],
        clickPoint: [],
        output: [],
        options: this.setOptions(step)
      }));
    });
    this.numberOfSteps = this.stepsArray.value.length;
  }

  public addSteps(optionSelection: string) {
    //Add nested steps depending on prior step selection
    this.workflow.steps.forEach(step => {
      step.options?.forEach(opt => {
        if (opt.text === optionSelection) {
          opt.nestedSteps.forEach(s => {
            this.stepsArray.push(this._fb.group({
              label: s.label,
              name: s.name,
              type: s.type,
              completed: [],
              clickPoint: [],
              output: [],
              options: this.setOptions(s)
            }));
          });
        };
      });
    });
    this.numberOfSteps = this.stepsArray.value.length;
  }

  public resetStepsArray(step: any) {
    // If prior selection was made on a nested step workflow, 
    // keep only that step then overwrite the other steps.
    let stepIndex = this.stepsArray.value.indexOf(step);
    const primaryStep = this.stepsArray.at(stepIndex);
    this.stepsArray.clear();
    this.stepsArray.push(primaryStep);
    this.stepsCompleted = 0; // reset steps completed counter
    this.finalStep = false; // reset final step boolean
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
        selected: []
      })
      );
    });
    return arr; 
  }

  public onContinue(formValue: any) {
    this._workflowService.setFormData(formValue);
  }

  public fillOutputs() {
    this.output = {};
    switch (this.workflowForm.value.title) {
      case "Example Workflow":
        this.getOutputs();
        break;
      case "Delineation":
        this.getOutputs();
        this.output.clickPoint = this.clickedPoint;
        this.output.layers = [this.splitCatchmentLayer];
        break;
      case "Fire Hydrology":
        if (this.workflowForm.value.steps[1].name === "selectFireHydroBasin") {
          this.output = {'clickPoint': this.clickedPoint, 'geologyInfo': this.geologyReport};
        }
        if (this.workflowForm.value.steps[1].name === "selectFireHydroPerimeter") {
          this.output = {'clickPoint': this.clickedPoint, 'selectedPerimetersInfo': this.selectedPerimeters, 'layers': this.firePerimetersLayers};
        }
        break;
    }
    this.workflowForm.value.outputs = this.output; 
  }

  public getOutputs(){
    this.workflowForm.value.steps.forEach(step => {
      step.options.forEach(option => {
        if (option.selected === true || option.selected === null) {
          this.output[step.name] = option.text;
        }
      });
    });
  }

  public nextStep(step: number) {
    this.workflowForm.value.steps[step].completed = true;
    this.stepsCompleted = this.stepsCompleted + 1;
    if (this.stepsCompleted == this.numberOfSteps) {
      // console.log(this.numberOfSteps);
      this.finalStep = true;
      // this.fillOutputs();
    } 
  }

  public finishedWorkflow(formValue: any) {
    this.fillOutputs();
    this._workflowService.setCompletedData(formValue);
    this._workflowService.setSelectedWorkflow(null);
    this._workflowService.setFormData(null);
  }

  public onCheckboxChange(option, step) {
    step.options.forEach(opt => {
      if (opt.text == option.text) {
        option.selected = true;

        // TODO: Update this once delineation has more routes/branches/paths to take with in the workflow
        // such as State-Based Delineation or Open-Source Delineation. Or other future workflows. 
        if (step.name === "selectFireHydroProcess") {
          this.resetStepsArray(step);
          this.addSteps(opt.text);
        }
      } else {
        opt.selected = false;
      }
    });
  }

  public populateForm() {
    this.setSteps();
    this.formData.steps.forEach((storedStep: any, index: any) => {
      storedStep.options.forEach((option: any) => {
        if (option.selected) {
          if (storedStep.name === "selectFireHydroProcess") {
            this.addSteps(option.text);
          };
        };
      });
      if (storedStep.completed) {
        this.nextStep(index);
      };
    });
    this.workflowForm.patchValue(this.formData);
  }


}
