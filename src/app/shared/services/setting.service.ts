
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Config } from '../interfaces/config/config';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
    public authHeader: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('auth') || ''
    });
    private configSettings: Config;

    constructor(private _http: HttpClient, private _configService: ConfigService) {
        this.configSettings = this._configService.getConfiguration();
    }

    // HTTP REQUESTS ////////////////////////////////////

    // ------------ GETS ---------------------------
    public getEntities(url: string) {
        return this._http
            .get(url, { headers: this.authHeader })
            //.map(res => { if (res) {return <Array<any>>res }})
            //.catch(this.errorHandler);
    }
    // ------------ POSTS ------------------------------
    // ------------ PUTS --------------------------------
    // ------------ DELETES ------------------------------


}