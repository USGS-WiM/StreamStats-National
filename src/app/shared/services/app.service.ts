// Overhead app services: whether the report builder, map options, or discover is selected, etc. 

import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private configSettings: Config;

  constructor(private _configService: ConfigService) {
    this.configSettings = this._configService.getConfiguration();
  }

  // Setting layer visibility in config settings
  public setLayerVisibility(layerName: string) {
    this.configSettings.workflowLayers.forEach((layer: any) => {
      if (layer.name === layerName && layer.visible) {
        layer.visible = false;
      }
    });
  }

}
