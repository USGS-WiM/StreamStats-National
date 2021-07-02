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

  constructor(private _http: HttpClient, private _configService: ConfigService) {
    this.configSettings = this._configService.getConfiguration();
  }

  // Get all of the workflows from external json file
  private _workflowSubject: Subject<Array<Workflow>> = new Subject<Array<Workflow>>();
  public get workflows(): Observable<Array<Workflow>> {
      return this._workflowSubject.asObservable();
  }
  public getWorkflows(): Observable<any>{
    return this._http.get(this.configSettings.workflowsURL, { headers: this.jsonHeader }); //This failed unit testing, but functioned in app
    //return this._http.get('assets/workflows.json');
  }

  //get all selected workflows
  private _selectedWorkflow: BehaviorSubject<Array<Workflow>> = new BehaviorSubject<Array<Workflow>>([]);
  public setSelectedWorkflows(w: Array<Workflow>) {
    this._selectedWorkflow.next(w);
  }
  public get selectedWorkflow(): Observable<Array<Workflow>> {
    return this._selectedWorkflow.asObservable();
  }
  
}
