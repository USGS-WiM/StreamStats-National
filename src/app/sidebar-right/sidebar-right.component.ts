import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';

@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html',
  styleUrls: ['./sidebar-right.component.scss']
})
export class SidebarRightComponent implements OnInit {
	
	popout = '';

	currentClick!: object;

  	constructor(private _mapService: MapService) { }

  	ngOnInit(): void {  
		// Getting current click point from map service to communicate to report component
		this._mapService.clickPoint.subscribe((point: object) => {
			this.currentClick = point; 
		});
  	}

}
