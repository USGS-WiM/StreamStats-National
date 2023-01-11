import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
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
export class AppComponent implements OnInit{
  title = 'StreamStats-National';
  private configSettings: Config;
  public version: string;

  sidebarView = "visible";

	constructor(private titleService: Title, private metaService: Meta, public mapService: MapService, private _configService: ConfigService) {
    	this.configSettings = this._configService.getConfiguration();
	}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.metaService.addTags([
      {name: 'keywords', content: 'USGS, US Geological Survey, United States Geological Survey, Stream Stats, StreamStats, watershed, basin characteristics, delineation, wildland fire, fire hydrology'},
      {name: 'description', content: 'The StreamStats National application provides users with access to analytical tools that are useful for a variety of purposes, including water-resources planning, management, engineering, and design.'}
    ]);
    this.version = this.configSettings.version;
		// initialize USWDS components
		modal.on(true);
	}

  // remove event listeners when component un-mounts.
  ngOnDestroy() {
	modal.off();
  }
}
