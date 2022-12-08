import { Component, Input, OnInit } from '@angular/core';
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
  public workflowData: any;
  
  // Delination output
  public clickedPoint;
  public splitCatchmentLayer;
  // Fire Hydrology: Query by Basin output
  public basinArea;
  public burnYears;
  public burnedArea;
  public geologyReport;
  public basinCharacteristics;
  public streamflowEstimates;
  // Fire Hydrology: Query by Fire Perimeters output
  public selectedPerimeters;
  public firePerimetersLayers;
  public output:any = {};
  public downstreamDist;

  constructor(private _fb: FormBuilder, public _mapService: MapService, private _workflowService: WorkflowService) {
    this.workflowForm = this._fb.group({
      title: [],
      steps: this._fb.array([]),
      outputs: []
    })
    this.stepsArray = this.workflowForm.controls['steps'] as FormArray;
  }

  ngOnInit(): void {

    if (this.formData === null) {
      console.log("here1");
      // Set steps if there is no prior form data
      this.setSteps();
    } else {
      // Set step and set values of prior form data
      console.log("here2");
      this.populateForm();
    }

    // Get clicked point
    this._mapService.clickPoint.subscribe((point: {}) => {
      this.clickedPoint = point;
    });
    // Get delineation and basin area
    this._mapService.delineationPolygon.subscribe((poly: any) => {
      var basin = poly;
      if (basin) {  
        this.splitCatchmentLayer = L.geoJSON(basin.features[1]);
      }
    });
    // Get basin area
    this._mapService.basinArea.subscribe((basinArea) => {
      this.basinArea = basinArea;
    });
    // Get burn years
    this._mapService.burnYears.subscribe((burnYears) => {
      this.burnYears = burnYears;
    });
    // Get burned area
    this._mapService.burnedArea.subscribe((burnedArea) => {
      this.burnedArea = burnedArea;
    });
    // Get geology results
    this._mapService.geologyReport.subscribe((geologyReport) => {
      this.geologyReport = geologyReport;
    });
    // Get basin characteristics
    this._mapService.basinCharacteristics.subscribe((basinCharacteristics) => {
      this.basinCharacteristics = basinCharacteristics;
    });
    // Get streamflow estimates
    this._mapService.streamflowEstimates.subscribe((streamflowEstimates) => {
      this.streamflowEstimates = streamflowEstimates;
    });
    // Get selected fire perimeters
    this._mapService.selectedPerimeters.subscribe((perimeters) => {
      this.selectedPerimeters = perimeters;
    });
    // Get selected fire perimeter layer
    this._mapService.firePerimetersLayers.subscribe((layers) => {
      this.firePerimetersLayers = layers;
    });
    // Get downstream trace distance
    this._mapService.downstreamDist.subscribe((downstreamDist) => {
      this.downstreamDist = downstreamDist;
    });
    this.onContinue(this.workflowForm.value);
    // Subscribe to workflow data
    this._workflowService.formData.subscribe(workflowData => {
      this.workflowData = workflowData;
    });
  }

  public setTitle() {
    this.workflowForm.patchValue({
      title: this.workflow.title
    });
  }

  public setSteps() {
    this.setTitle();
    console.log(this.workflow.steps);
    console.log(this.workflowData);
    this.workflow.steps.forEach(step => {
      console.log(step);
      this.stepsArray.push(this._fb.group({
        label: step.label,
        name: step.name,
        type: step.type,
        description: step.description,
        cursor: step.cursor,
        completed: [],
        clickPoint: [],
        output: [],
        options: this.setOptions(step)
      }));
    });
    this.numberOfSteps = this.stepsArray.value.length;
    this.setCurrentStep(0);
    console.log(this.stepsArray);
  }

  public addSteps(optionSelection: string) {
    // Add nested steps depending on prior step selection
    console.log(this.workflow.steps);
    this.workflow.steps.forEach(step => {
      step.options?.forEach(opt => {
        if (opt.text === optionSelection) {
          opt.nestedSteps.forEach(s => {
            this.workflowData.steps.push({
              label: s.label,
              name: s.name,
              type: s.type,
              cursor: s.cursor,
              description: s.description,
              completed: false,
              clickPoint: [],
              output: [],
              options: s.options
            });
          });
        };
      });
    });
    this.numberOfSteps = this.workflowData.steps.length;
  }

  public resetStepsArray(step: any) {
    // If prior selection was made on a nested step workflow, 
    // keep only that step then overwrite the other steps.
    console.log(this.stepsArray);
    console.log(this._workflowService.formData);
    console.log(this.workflowData);
    let stepIndex = this.workflowData.steps.indexOf(step);
    console.log(stepIndex);
    const primaryStep = this.workflowData.steps.at(stepIndex);
    console.log(primaryStep);
    this.workflowData.steps = [];
    this.workflowData.steps.push(primaryStep);
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
      switch(step.type) {
        case 'radio':
          arr.push(this._fb.group({
            text: opt.text,
            selectedRadio: opt.selected
          }));
          break;
        case 'checkbox':
          arr.push(this._fb.group({
            text: opt.text,
            selectedCheckbox: opt.selected
          }));
          break;
        case 'subscription':
          arr.push(this._fb.group({
            text: opt.text
          }));
          break;
        case 'text':
          arr.push(this._fb.group({
            text: opt.text
          }));
          break;
      }

    });
    return arr; 
  }

  public onContinue(formValue: any) {
    this._workflowService.setFormData(formValue);
  }

  public fillOutputs() {
    this.output = {};
    switch (this.workflowData.title) {
      case "Delineation":
        this.getOutputs();
        this.output = {
          'clickPoint': this.clickedPoint, 
          'layers': [this.splitCatchmentLayer],
          'basinCharacteristics': this.basinCharacteristics
        }
        break;
      case "Fire Hydrology":
        if (this.workflowData.steps[1].name === "selectFireHydroBasin") {
          this.output = {
            'clickPoint': this.clickedPoint, 
            'layers': [this.splitCatchmentLayer],
            'basinArea': this.basinArea, 
            'burnYears': this.burnYears,
            'burnedArea': this.burnedArea,
            'geologyInfo': this.geologyReport,
            'basinCharacteristics': this.basinCharacteristics,
            'streamflowEstimates': this.streamflowEstimates
          };
        } else if (this.workflowData.steps[1].name === "selectFireHydroPerimeter") {
          this.output = {
            'clickPoint': this.clickedPoint, 
            'layers': this.firePerimetersLayers,
            'downstreamDist' : this.downstreamDist,
            'selectedPerimetersInfo': this.selectedPerimeters};
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

  public setCurrentStep(step:number) {
    if (step == null) {
      this._workflowService.setCurrentStep(null);
    } else {
      if (this.workflowData) {
        this._workflowService.setCurrentStep(this.workflowData.steps[step]);
      } else {
        this._workflowService.setCurrentStep(this.workflowForm.value.steps[step]);
      }
    }
  }

  public nextStep(step: number) {
    console.log(step);
    console.log(this.workflowData);
    console.log(this._workflowService.formData);
    this.workflowData.steps[step].completed = true;
    this.stepsCompleted = this.stepsCompleted + 1;
    if (this.stepsCompleted == this.numberOfSteps) {
      this.finalStep = true;
      this.setCurrentStep(null);
    } else {
      this.setCurrentStep(step + 1);
    }
  }

  public finishedWorkflow(formValue: any) {
    this.fillOutputs();
    this._workflowService.setCompletedData(formValue);
    this._workflowService.setSelectedWorkflow(null);
    this._workflowService.setFormData(null);
  }

  public onRadioChange(option, step) {
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

  public onCheckboxChange(option, step) {
    step.options.forEach(opt => {
      if (opt.text == option.text) {
        option.selected = option.selected ? false : true
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
