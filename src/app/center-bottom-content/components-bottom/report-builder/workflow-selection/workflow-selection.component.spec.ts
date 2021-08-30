import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { AppService } from 'src/app/shared/services/app.service';

import { WorkflowSelectionComponent } from './workflow-selection.component';

class MockAppService {
  setReportBuilder(val: any) {
    return val;
  }
  setWorkflowComponent(val: any) {
    return val;
  }
}

describe('WorkflowSelectionComponent', () => {
  let component: WorkflowSelectionComponent;
  let fixture: ComponentFixture<WorkflowSelectionComponent>;
  let appService: AppService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        WorkflowSelectionComponent,
        { provide: AppService, useClass: MockAppService} 
      ],
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ WorkflowSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowSelectionComponent);
    appService = TestBed.inject(AppService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  // TODO: update to make sure certain elements are loading in the DOM once more finalized. 
  // it('should have <h3> with "Choose Workflows:"', () => {
  //   const reportBuilderElement: HTMLElement = fixture.nativeElement;
  //   const h3 = reportBuilderElement.querySelector('h3');
  //   expect(h3?.textContent).toEqual("Choose Workflows:");
  // });
});