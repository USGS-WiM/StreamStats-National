import { Component } from '@angular/core';
import { Config } from './shared/interfaces/config/config';
import { ConfigService } from './shared/config/config.service';
import { MapService } from './shared/services/map.service';

// Import USWDS
import USWDS from "../../node_modules/uswds/src/js/components";
const { modal } = USWDS;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  title = 'StreamStats-National';
  private configSettings: Config;
  public version: string;

	constructor(public mapService: MapService, private _configService: ConfigService) {
    this.configSettings = this._configService.getConfiguration();
    this.version = this.configSettings.version;
	}

  	ngOnInit() {

		// initialize USWDS components
		modal.on(true);
	}

  // remove event listeners when component un-mounts.
  ngOnDestroy() {
	modal.off();
  }
}
