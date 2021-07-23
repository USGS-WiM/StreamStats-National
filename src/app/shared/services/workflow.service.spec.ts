import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { WorkflowService } from './workflow.service';

describe('WorkflowService', () => {
  let workflowService: WorkflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    workflowService = TestBed.inject(WorkflowService);
  });

  it('should be created', () => {
    expect(workflowService).toBeTruthy();
  });

  it('#getObservableValue should return value from observable', () => {
    workflowService.getWorkflows().subscribe(value => {
      expect(value).toBe('observable value');
    });
  });

});
