import { Component } from '@angular/core';
import { MapService } from './shared/services/map.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  title = 'StreamStats-National';

  constructor(public mapService: MapService) {}

  ngOnInit() {
  }
}
