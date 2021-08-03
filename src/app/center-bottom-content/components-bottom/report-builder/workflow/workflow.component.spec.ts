import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Workflow } from 'src/app/shared/interfaces/workflow/workflow';
import { WorkflowComponent } from './workflow.component';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ WorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });

  // it('#selectedWorkflow should display a selected workflow values', () => {
  //   const workflow: Workflow[] = [{
  //     title: "Delineation",
  //     description: "string",
  //     functionality: "string",
  //     icon: "string",
  //     steps: [],
  //     output: []
  //   }];
  //   //component.selectedWorkflows = workflow;
  //   fixture.detectChanges();
  //   //expect(component.selectedWorkflows[0].title).toEqual(workflow[0].title);
  // });

  // TODO: update to make sure certain elements are loading in the DOM once more finalized. 
  // it('should have <p> with "workflow works!"', () => {
  //   const workflowElement: HTMLElement = fixture.nativeElement;
  //   const p = workflowElement.querySelector('p');
  //   expect(p?.textContent).toEqual("workflow works!");
  // });
});
