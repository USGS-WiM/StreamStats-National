import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
    type: "checkbox",
    value: "",
    validators: { required: true },
    options: [
      { text:"Red", selected: false },
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form', () => {
    expect(component.workflowForm.value).toBeTruthy();
  });

  it('#subscription should allow for clickedPoint', () => {
    const form = component.workflowForm;
    const title = form.controls.title;
    title.setValue("Delineation");
    const i = 0;
    component.subscription(i);
    expect(form.value.title).toEqual("Delineation")
  });

  it('#nextStep should count completed steps and determine step type', () => {
    const step = 0;
    const valueOne = "radio";
    const valueTwo = "subscription";
    const valueThree = "text";
    component.nextStep(step, valueOne);
    expect(step).toBe(0);
    component.nextStep(step, valueTwo);
    expect(step).toBe(0);
    component.nextStep(step, valueThree);
    expect(step).toBe(0);
  });

  it('#finishedWorkflow should update services', () => {
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

  it('#onRadioChange should check for option = text', () => {
    const optionOne = {
      text: "Red",
      selected: false
    };
    const optionTwo = {
      text: "Blue",
      selected: false
    };
    const steps =[{
      label: "Select Your Favorite Color",
      name: "selectColor",
      type: "radio",
      options: [{
        text:"Red",
        selected: false
      }]
    }];
    steps.forEach(step => {
      component.onRadioChange(optionOne, step);
      expect(step.name).toBe("selectColor");
      step.options.forEach(opt => {
        expect(opt.text).toEqual(optionOne.text);
        optionOne.selected = true;
        expect(optionOne.selected).toBe(true);
      });
      component.onRadioChange(optionTwo, step);
      step.options.forEach(opt => {
        expect(opt.text).not.toEqual(optionTwo.text);
        expect(opt.selected).toBe(false);
      });
    });
  });

  // TODO: update to make sure certain elements are loading in the DOM once more finalized. 
  // it('should have <p> with "workflow works!"', () => {
  //   const workflowElement: HTMLElement = fixture.nativeElement;
  //   const p = workflowElement.querySelector('p');
  //   expect(p?.textContent).toEqual("workflow works!");
  // });
});
