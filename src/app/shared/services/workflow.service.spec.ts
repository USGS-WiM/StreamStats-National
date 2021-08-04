import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { WorkflowService } from './workflow.service';

describe('WorkflowService', () => {
  let workflowService: WorkflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowService
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    workflowService = TestBed.inject(WorkflowService);
  });

  it('should be created', () => {
    expect(workflowService).toBeTruthy();
  });

  it('get #selectedWorkflow should return value', () => {
    workflowService.selectedWorkflow.subscribe(value => {
      expect(value).toBeTruthy();
    });
  });

  it('#getWorkflows should be called', () => {
    let response: any;
    spyOn(workflowService, 'getWorkflows').and.callThrough();
    workflowService.selectedWorkflow.subscribe(value => {
      response = value;
    });
    workflowService.getWorkflows();
    expect(workflowService.getWorkflows).toHaveBeenCalled();
  });

});
