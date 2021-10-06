import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
    private _loaderSubject = new Subject<boolean>();
    public loaderState = this._loaderSubject.asObservable();

    constructor() { }

    public showFullPageLoad() {
        this._loaderSubject.next(true);
    }
    public hideFullPageLoad() {
        this._loaderSubject.next(false);
    }
}