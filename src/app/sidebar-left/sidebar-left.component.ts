import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/shared/services/map.service';

@Component({
	selector: 'app-sidebar-left',
	templateUrl: './sidebar-left.component.html',
	styleUrls: ['./sidebar-left.component.scss']
})
export class SidebarLeftComponent implements OnInit {

	popout = '';
	discoverTab = '';

	title = 'StreamStats-National';

  	constructor(private _mapService: MapService) { }

	ngOnInit(): void {

	}

	// Remove the existing basemap and add the newly selected basemap
	public toggleBasemap(selectedBase: string) {
		this._mapService.map.removeLayer(this._mapService.baseMaps[this._mapService.chosenBaseLayer ]);
		this._mapService.chosenBaseLayer = selectedBase;
		this._mapService.map.addLayer(this._mapService.baseMaps[selectedBase]);
	}


}
