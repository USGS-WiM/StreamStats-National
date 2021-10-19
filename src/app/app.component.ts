import { Component } from '@angular/core';
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

	constructor(public mapService: MapService) {

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
