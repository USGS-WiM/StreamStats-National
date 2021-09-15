import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { WorkflowService } from '../shared/services/workflow.service';
import { WorkflowSelectionComponent } from './components-bottom/report-builder/workflow-selection/workflow-selection.component';

import { CenterBottomContentComponent } from './center-bottom-content.component';

let mockWorkflowService: Partial<WorkflowService>;

describe('CenterBottomContentComponent', () => {
  let component: CenterBottomContentComponent;
  let fixture: ComponentFixture<CenterBottomContentComponent>;
  //let appService: AppService;
  let workflowService: WorkflowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        CenterBottomContentComponent,
        { provide: WorkflowService, useClass: mockWorkflowService }  
      ],
      imports: [
        HttpClientTestingModule,
        WorkflowSelectionComponent
      ],
      declarations: [ CenterBottomContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockWorkflowService = {
      selectedWorkflow: new Observable<Workflow[]>()
    };
    fixture = TestBed.createComponent(CenterBottomContentComponent);
    workflowService = TestBed.inject(WorkflowService)
    //workflowService = fixture.debugElement.injector.get(WorkflowService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Testing service dependencies 
  it('#selectedWorkflow should display a selected workflow values', () => {
    const workflow: Workflow[] = [{
      title: "Delineation",
      description: "string",
      functionality: "string",
      icon: "string",
      steps: [],
      output: []
    }];
    component.selectedWorkflows = workflow;
    expect(component.selectedWorkflows[0].title).toEqual(workflow[0].title);
  });

  afterEach(() => {
    fixture.destroy();
  })
});
