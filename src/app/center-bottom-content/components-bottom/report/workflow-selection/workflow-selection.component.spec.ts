import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

import { WorkflowSelectionComponent } from './workflow-selection.component';

let mockWorkflowService: Partial<WorkflowService>;

describe('WorkflowSelectionComponent', () => {
  let component: WorkflowSelectionComponent;
  let fixture: ComponentFixture<WorkflowSelectionComponent>;
  let workflowService: WorkflowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        WorkflowSelectionComponent,
        { provide: WorkflowService, useClass: mockWorkflowService } 
      ],
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ WorkflowSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockWorkflowService = {
      selectedWorkflow: new Observable<Workflow[]>()
    };
    fixture = TestBed.createComponent(WorkflowSelectionComponent);
    workflowService = TestBed.inject(WorkflowService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('#addRemoveWorkflow should be called and add/remove a workflow', () => {
    const workflow: Workflow = {
      title: "Delineation",
      description: "string",
      functionality: "string",
      icon: "string",
      steps: [],
      output: []
    };
    //add workflow
    const spy = spyOn(workflowService, 'setSelectedWorkflows').and.callThrough();
    component.addRemoveWorkflow(workflow);
    expect(spy).toHaveBeenCalled();
    //remove workflow
    component.addRemoveWorkflow(workflow);
    expect(spy).toHaveBeenCalled();
  });

  // TODO: update to make sure certain elements are loading in the DOM once more finalized. 
  // it('should have <h3> with "Choose Workflows:"', () => {
  //   const reportBuilderElement: HTMLElement = fixture.nativeElement;
  //   const h3 = reportBuilderElement.querySelector('h3');
  //   expect(h3?.textContent).toEqual("Choose Workflows:");
  // });
});
