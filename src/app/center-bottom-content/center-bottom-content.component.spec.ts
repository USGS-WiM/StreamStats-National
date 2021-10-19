import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { WorkflowService } from '../shared/services/workflow.service';
import { WorkflowSelectionComponent } from './components-bottom/report-builder/workflow-selection/workflow-selection.component';
import { CenterBottomContentComponent } from './center-bottom-content.component';

describe('CenterBottomContentComponent', () => {
  let component: CenterBottomContentComponent;
  let fixture: ComponentFixture<CenterBottomContentComponent>;
  let workflowService: WorkflowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        CenterBottomContentComponent
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
    fixture = TestBed.createComponent(CenterBottomContentComponent);
    workflowService = TestBed.inject(WorkflowService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#addFormData should update form data service', () => {
    spyOn(component, 'addFormData').and.callThrough();
    const formData = {
      title: "Example Workflow",
      description: "This is an example workflow.",
      functionality: "Core",
      icon: "fa fa-sitemap"
      };
      component.addFormData(formData);
      expect(component.addFormData).toHaveBeenCalled();
  });

  it('#removeWorkflow should remove workflow and form data', () => {
    const mockWorkflow: Workflow = {
      title: "Delineation",
      description: "string",
      functionality: "string",
      icon: "string",
      steps: [],
      output: []
    };
    component.selectedWorkflow = mockWorkflow;
    expect(component.selectedWorkflow).toEqual(mockWorkflow);
    component.removeWorkFlow();
    expect(component.selectedWorkflow).toEqual(null);
  });
  
});
