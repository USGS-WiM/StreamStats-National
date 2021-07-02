import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Workflow } from '../shared/interfaces/workflow/workflow';
import { AppService } from '../shared/services/app.service';
import { WorkflowService } from '../shared/services/workflow.service';

import { CenterBottomContentComponent } from './center-bottom-content.component';

class MockWorkflowService {
  setSelectedWorkflows(val: any) {
    return val;
  }
}

describe('CenterBottomContentComponent', () => {
  let component: CenterBottomContentComponent;
  let fixture: ComponentFixture<CenterBottomContentComponent>;
  //let appService: AppService;
  let workflowService: WorkflowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        CenterBottomContentComponent,
        //{ provide: WorkflowService, useClass: MockWorkflowService }  
      ],
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ CenterBottomContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterBottomContentComponent);
    //appService = TestBed.inject(AppService)
    workflowService = TestBed.inject(WorkflowService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#selectedWorkflow should display a selected workflow values', () => {
    const workflow: Workflow[] = [{
      title: "Delineation",
      description: "string",
      functionality: "string",
      icon: "string",
      steps: [],
      output: []
    }];
    //component.selectedWorkflows = workflow;
    fixture.detectChanges();
    //expect(component.selectedWorkflows[0].title).toEqual(workflow[0].title);
  });

  it('#addRemoveWorkflow should be called and return a workflow', () => {
    const workflow: Workflow = {
      title: "Delineation",
      description: "string",
      functionality: "string",
      icon: "string",
      steps: [],
      output: []
    };
    const spy = spyOn(workflowService, 'setSelectedWorkflows').and.callThrough();
    //component.addRemoveWorkflow(workflow);
    expect(spy).toHaveBeenCalled();
  });

  afterEach(() => {
    fixture.destroy();
  })
});
