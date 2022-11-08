import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { WorkflowComponent } from './workflow.component';
import { ToastrModule } from 'ngx-toastr';

let mockWorkflow: Workflow = {
  title: "Example Workflow",
  description: "This is an example workflow.",
  functionality: "Core",
  icon: "fa fa-sitemap",
  steps: [{
    label: "Select Your Favorite Color",
    name: "selectColor",
    description: "Slect your favorite color from the list below.",
    type: "checkbox",
    cursor: "auto",
    value: "",
    validators: { required: true },
    options: [
      { 
        text:"Query by Fire Perimeters", 
        selected: false,
        nestedSteps: [
          { 
            label: "nested step label", 
            name: "name", 
            description:"nest step description",
            cursor: "auto",
            type: "type" ,
            value: "value"
          }] 
    },
      { text:"Yellow", selected: false },
      { text:"Blue", selected: false }]
    }
  ],
  output: [{
      value: "",
      valueType: "geojson",
      displayType: "map", 
      complete: false
  }]
};

let mockFormData = {
  title: "Fire Hydrology",
  steps: [{
    label: "Select a Fire Hydrology Query Method",
    name: "selectFireHydroProcess",
    type: "checkbox",
    options: [
      { text: "Query by Basin", selected: false },
      { text: "Query by Fire Perimeters", selected: true }
    ], 
    clickPoint: null,
    completed: false, 
    output: null
  }, {
    label: "Select a Fire Perimeter",
    name: "selectFireHydroPerimeter",
    type: "subscription",
    options: [
      { text: "Click on the map", selected: false }
    ],
    clickPoint: null,
    completed: false, 
    output: null
  }],
  outputs: null
};

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FormBuilder
      ],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        ToastrModule.forRoot()
      ],
      declarations: [ WorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
    component.workflow = mockWorkflow;
    component.formData = null;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form', () => {
    expect(component.workflowForm.value).toBeTruthy();
  });

  it('#addSteps should add nested steps to form', () => {
    expect(component.stepsArray.value.length).toEqual(1);
    const optionSelection = "Query by Fire Perimeters";
    component.addSteps(optionSelection);
    expect(component.stepsArray.value.length).toEqual(2);
  });

  it('#nextStep should count completed steps and determine step type', () => {
    const step = 0;
    component.nextStep(step);
    expect(step).toBe(0);
  });

  it('#onContinue should set form data', () => {
    spyOn(component, 'onContinue').and.callThrough();
    const formValue = {
      outputs: null,
      steps: [{
        clickPoint: null,
        completed: true,
        label: "Select Delineation Process"
      }],
      title: "Delineation"
    };
    component.onContinue(formValue);
    expect(component.onContinue).toHaveBeenCalled();
  });

  it('#fillOutputs should add outputs to workflow form data', () => {
    const workflowOne = new FormGroup({
      title: new FormControl("Example Workflow"),
      steps: new FormArray([]),
      outputs: new FormControl()
    });
    const workflowTwo = new FormGroup({
      title: new FormControl("Delineation"),
      steps: new FormArray([]),
      outputs: new FormControl()
    });
    const workflowThree = new FormGroup({
      title: new FormControl("Fire Hydrology"),
      steps: new FormArray([
        new FormGroup({
          name: new FormControl("selectFireHydroBasin")
        }),
        new FormGroup({
          name: new FormControl("selectFireHydroPerimeter")
        }),
      ]),
      outputs: new FormControl()
    });
    
    component.workflowForm = workflowOne;
    component.fillOutputs();
    expect(component.workflowForm).toBe(workflowOne);

    component.workflowForm = workflowTwo;
    component.fillOutputs();
    expect(component.workflowForm).toBe(workflowTwo);

    component.workflowForm = workflowThree;
    component.fillOutputs();
    expect(component.workflowForm).toBe(workflowThree);
    component.workflowForm = workflowThree;
    component.fillOutputs();
    expect(component.workflowForm).toBe(workflowThree);
  });

  it('#finishedWorkflow should update services', () => {
    component.formData = mockFormData;
    spyOn(component, 'finishedWorkflow').and.callThrough();
    const formData = {
      title: "Example Workflow",
      description: "This is an example workflow.",
      functionality: "Core",
      icon: "fa fa-sitemap"
    };
    component.finishedWorkflow(formData);
    expect(component.finishedWorkflow).toHaveBeenCalled();
  });

  it('#onCheckboxChange should check for option = text', () => {
    const optionOne = {
      text: "Red",
      selected: false
    };
    const optionTwo = {
      text: "Blue",
      selected: false
    };
    const stepsSetOne =[{
      label: "Select Your Favorite Color",
      name: "selectColor",
      type: "checkbox",
      options: [{
        text:"Red",
        selected: false
      }]
    }];
    
    stepsSetOne.forEach(step => {
      component.onCheckboxChange(optionOne, step);
      expect(step.name).toBe("selectColor");
      step.options.forEach(opt => {
        expect(opt.text).toEqual(optionOne.text);
        optionOne.selected = true;
        expect(optionOne.selected).toBe(true);
      });
      component.onCheckboxChange(optionTwo, step);
      step.options.forEach(opt => {
        expect(opt.text).not.toEqual(optionTwo.text);
        expect(opt.selected).toBe(false);
      });
    });
  });

  it('#populateForm should setSteps and addSteps when formData != null', () => {
    component.formData = mockFormData;
    component.populateForm();
    expect(component.workflowForm.value.title).toBe("Fire Hydrology");
  });

  // TODO: update to make sure certain elements are loading in the DOM once more finalized. 
  // it('should have <p> with "workflow works!"', () => {
  //   const workflowElement: HTMLElement = fixture.nativeElement;
  //   const p = workflowElement.querySelector('p');
  //   expect(p?.textContent).toEqual("workflow works!");
  // });
});
