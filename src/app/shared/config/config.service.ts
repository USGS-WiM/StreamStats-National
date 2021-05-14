import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../interfaces/config';
import { Workflow } from '../interfaces/workflow';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config!: Config;

  constructor(private _http: HttpClient) { }

  public loadConfig(url: string) {
    return new Promise<void>(resolve => {
      this._http.get(url)
      .subscribe((config: Config | any) => {
        this.config = config;
        resolve();
      })
    })
  }

  public getConfiguration(): Config {
    return this.config;
  }

}
