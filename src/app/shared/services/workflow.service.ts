// Workflow-related: selecting workflows, carrying out workflows, adding report items, etc. 

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';
import { Workflow } from '../interfaces/workflow/workflow';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  private jsonHeader: HttpHeaders = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  private configSettings: Config;
  public completedWorkflows = [];

  constructor(private _http: HttpClient, private _configService: ConfigService) {
    this.configSettings = this._configService.getConfiguration();
  }

  // Get all of the workflows from external json file
  private _workflowSubject: Subject<Array<Workflow>> = new Subject<Array<Workflow>>();
  public get workflows(): Observable<Array<Workflow>> {
      return this._workflowSubject.asObservable();
  }
  public getWorkflows(): Observable<any>{
    //return this._http.get(this.configSettings.workflowsURL, { headers: this.jsonHeader }); //This failed unit testing, but functioned in app
    return this._http.get('assets/workflows.json');
  }

  //get all selected workflows
  private _selectedWorkflow: Subject<Workflow> = new Subject<Workflow>();
  public setSelectedWorkflow(w: Workflow) {
    this._selectedWorkflow.next(w);
  }
  public get selectedWorkflow(): Observable<Workflow> {
    return this._selectedWorkflow.asObservable();
  }

  //get all completed current workflow form data
  private _formData: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>(null);
  public setFormData(obj: Array<any>) {
    this._formData.next(obj);
  }
  public get formData(): Observable<Array<any>>{
    return this._formData.asObservable();
  }
  
  //get all selected workflows
  private _completedData: BehaviorSubject<Array<Workflow>> = new BehaviorSubject<Array<Workflow>>([]);
  public setCompletedData(w: Array<Workflow>) {
    this.completedWorkflows.push(w);
    this._completedData.next(this.completedWorkflows);
  }
  public get completedData(): Observable<Array<Workflow>> {
    return this._completedData.asObservable();
  }
}
