import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

@Component({
    selector: 'app-loading-screen',
    templateUrl: 'loader.component.html',
    styleUrls: ['loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {
    public show = false; // start
    private subscription: Subscription;

    constructor(private _loaderService: LoaderService) {}

    ngOnInit() {
      this.subscription = this._loaderService.loaderState.subscribe((state: boolean) => {
        this.show = state;
      });
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
}