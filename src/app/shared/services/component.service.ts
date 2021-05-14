import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ComponentItem } from '../interfaces/active.component';
import { Workflow } from '../interfaces/workflow';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  // Show/Hide Workflow Component
  private _showHideWorkflowComponent: Subject<boolean> = new Subject<boolean>();
  public setWorkflowComponent(val: any) {
    this._showHideWorkflowComponent.next(val);
  }
  public get showWorkflowComponent(): any {
    return this._showHideWorkflowComponent.asObservable();
  }

  // Add/Remove Workflow Component
  private _addRemoveWorkflowComponent: Subject<any> = new Subject<any>();
  public setAddWorkflowComponent(val: any) {
    this._addRemoveWorkflowComponent.next(val);
  }
  public get addRemoveWorkflowComponent(): any {
    return this._addRemoveWorkflowComponent.asObservable();
  }

  private _workflowSubject = new Subject<any>();
  public setWorkflows(workflows: Array<Workflow>) {
    this._workflowSubject.next(workflows);
  }
  public get Workflows(): Observable<Array<Workflow>> {
    return this._workflowSubject.asObservable();
  }

  getComponents() {
    //if in selection array, then return the component here
    return [
      //new AdItem(NldiDelineationComponent, {}),
      //new ComponentItem(NldiDelineationComponent),
      //new AdItem(NldiFlowtraceComponent, {}),
      //new ComponentItem(NldiFlowtraceComponent),
    ];
  }

}
