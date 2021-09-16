import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';

@Injectable({
  providedIn: 'root'
})
export class NLDIService {

  private configSettings!: Config;
  private jsonHeader: HttpHeaders = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json'  
  });
  public hasDelineation: boolean = false;

  constructor(private _http: HttpClient, private _configService: ConfigService) {
    this.configSettings = this._configService.getConfiguration();
  }

  // NLDI Delineation
  private _delineationSubject: Subject<any> = new Subject<any>();

  public getUpstream(lat: any, lng: any, upstream: any) {
    const options = { headers: this.jsonHeader, observe: 'response' as 'response'};
    let url = this.configSettings.nldiBaseURL + this.configSettings.nldiSplitCatchmentURL;
    let post = {
      "inputs": [
        {
          "id": "lat",
          "value": lat,
          "type": "text/plain"
        },
        {
          "id": "lon",
          "value": lng,
          "type": "text/plain"
        },
        {
          "id": "upstream",
          "value": upstream,
          "type": "text/plain"
        }
      ]
    }
    return this._http.post(url, post, options).subscribe(resp => {
      this._delineationSubject.next({polygon: resp.body, latitude: lat, longitude: lng});
      this.hasDelineation = true;
      return resp.body;
    });
  };

  public get delineationPolygon(): any {
    return this._delineationSubject.asObservable();
  };
}
