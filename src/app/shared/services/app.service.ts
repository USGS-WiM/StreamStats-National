// Overhead app services: whether the report builder, map options, or discover is selected, etc. 

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private configSettings: Config;

  constructor(private _configService: ConfigService) { 
    this.configSettings = this._configService.getConfiguration();
  }

  // Show/Hide Workflow/Report Builder Component
  private _showHideReportBuilder: Subject<boolean> = new Subject<boolean>();
  public setReportBuilder(val: any) {
    this._showHideReportBuilder.next(val);
  }
  public get showReportBuilder(): any {
    return this._showHideReportBuilder.asObservable();
  }
  private _showHideWorkflowComponent: Subject<boolean> = new Subject<boolean>();
  public setWorkflowComponent(val: any) {
    this._showHideWorkflowComponent.next(val);
  }
  public get showWorkflowComponent(): any {
    return this._showHideWorkflowComponent.asObservable();
  }

  //TODO Show/Hide Map Options Component

  //TODO Show/Hide Discover Component

}
