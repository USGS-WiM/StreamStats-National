import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { WorkflowService } from '../shared/services/workflow.service';
import { WorkflowSelectionComponent } from './components-bottom/report-builder/workflow-selection/workflow-selection.component';
import { CenterBottomContentComponent } from './center-bottom-content.component';

let mockWorkflowService: Partial<WorkflowService>;

describe('CenterBottomContentComponent', () => {
  let component: CenterBottomContentComponent;
  let fixture: ComponentFixture<CenterBottomContentComponent>;
  let workflowService: WorkflowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        CenterBottomContentComponent,
        //{ provide: WorkflowService, useClass: mockWorkflowService }  
      ],
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ 
        CenterBottomContentComponent,
        WorkflowSelectionComponent 
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockWorkflowService = {
      selectedWorkflow: new Observable<Workflow>()
    };
    fixture = TestBed.createComponent(CenterBottomContentComponent);
    workflowService = TestBed.inject(WorkflowService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#selectedWorkflow should display a selected workflow values', () => {
    const workflow: Workflow = {
      title: "Delineation",
      description: "string",
      functionality: "string",
      icon: "string",
      steps: [],
      output: []
    };
    component.selectedWorkflow = workflow;
    expect(component.selectedWorkflow.title).toEqual(workflow.title);
  });

  it('#addFormData should take first if path and push formData', () => {
    expect(component.formDataOutputs.length).toBe(0);
    const formData = {
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
    };
    component.addFormData(formData);
    expect(component.formDataOutputs.length).toBe(1);
  });

  it('#addFormData should take else path and find duplicate', () => {
    const prevFormmData: any = [{
      title: "Example Workflow",
      description: "This is an example workflow.",
      functionality: "Core",
      icon: "fa fa-sitemap"
    },{
      title: "Second Workflow",
      description: "This is number two",
      functionality: "Core",
      icon: "fa fa-sitemap"
    }];
    const formData = {
      title: "Third Workflow",
      description: "This is an example workflow.",
      functionality: "Core",
      icon: "fa fa-sitemap"
    };
    component.formDataOutputs = prevFormmData;
    expect(component.formDataOutputs.length).toBe(2);
    expect(component.formDataOutputs).not.toContain(formData);
    component.addFormData(formData);
    expect(component.formDataOutputs).toContain(formData);
  });

  it('#addFormData should take else path and and take else path again', () => {
    const prevFormmData: any = [{
      title: "Example Workflow",
      description: "This is an example workflow.",
      functionality: "Core",
      icon: "fa fa-sitemap"
    },{
      title: "Second Workflow",
      description: "This is number two",
      functionality: "Core",
      icon: "fa fa-sitemap"
    }];
    component.formDataOutputs = prevFormmData;
    expect(component.formDataOutputs.length).toBe(2);
    const duplicate = {
      title: "Example Workflow",
      description: "This is an example workflow.",
      functionality: "Core",
      icon: "fa fa-sitemap"
    };
    expect(component.formDataOutputs).toContain(duplicate);
    const index = component.formDataOutputs.indexOf(duplicate);
    component.formDataOutputs.splice(index, 1, duplicate);
    component.addFormData(duplicate);
    expect(component.formDataOutputs).toContain(duplicate);
    expect(component.formDataOutputs.length).toBe(2);
  });

});
