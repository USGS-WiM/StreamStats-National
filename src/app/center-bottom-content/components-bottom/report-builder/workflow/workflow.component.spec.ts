import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { WorkflowComponent } from './workflow.component';

let mockWorkflow: Workflow = {
    title: "Example Workflow",
    description: "This is an example workflow.",
    functionality: "Core",
    icon: "fa fa-sitemap",
    steps:
    [
        {
            label: "Select Your Favorite Color",
            name: "selectColor",
            type: "checkbox",
            value: "",
            validators: 
            {
                required: true
            },
            options:
            [
                {
                    text:"Red",
                    selected: false
                },
                {
                    text:"Yellow",
                    selected: false
                },
                {
                    text:"Blue",
                    selected: false
                }
            ]
        }
    ],
    output: [        {
        value: "",
        valueType: "geojson",
        displayType: "map", 
        complete: false
    }],
    isSelected: true
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
        ReactiveFormsModule
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


  // TODO: update to make sure certain elements are loading in the DOM once more finalized. 
  // it('should have <p> with "workflow works!"', () => {
  //   const workflowElement: HTMLElement = fixture.nativeElement;
  //   const p = workflowElement.querySelector('p');
  //   expect(p?.textContent).toEqual("workflow works!");
  // });
});
