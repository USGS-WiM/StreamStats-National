import { Component } from '@angular/core';
import { ConfigService } from '../shared/config/config.service';
import { AppService } from '../shared/services/app.service';

// interfaces
import { Config } from '../shared/interfaces/config/config';

@Component({
  selector: 'app-center-bottom-content',
  templateUrl: './center-bottom-content.component.html',
  styleUrls: ['./center-bottom-content.component.scss']
})
export class CenterBottomContentComponent {
  public showHideReportBuilder!: boolean;
  public showHideWorkflow!: boolean;
  private configSettings: Config;

  constructor(private _appService: AppService, private _configService: ConfigService) { 
    this.configSettings = this._configService.getConfiguration();
  }

  ngOnInit(): void {
    this._appService.showReportBuilder.subscribe((resp: boolean) => {
      this.showHideReportBuilder = resp // show/hide report builder from click on Sidebar Left
    });
    this._appService.showWorkflowComponent.subscribe((resp: boolean) => {
      this.showHideWorkflow = resp // show/hide workflow component
    });
  }

}
