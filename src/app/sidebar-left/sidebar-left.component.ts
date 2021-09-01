import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/shared/services/map.service';
declare let search_api: any;

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

	public geosearch(): void {
		search_api.create( "searchBox", {
			on_result: function(o: any) {
				// what to do when a location is found
				// o.result is geojson point feature of location with properties
				this.map
					.fitBounds([ // zoom to location
						[ o.result.properties.LatMin, o.result.properties.LonMin ],
						[ o.result.properties.LatMax, o.result.properties.LonMax ]
					])
					.openPopup(  // open popup at location listing all properties
						this.map( Object.keys(o.result.properties), function(property: any) {
							return "<b>" + property + ": </b>" + o.result.properties[property];
						}).join("<br/>"),
						[ o.result.properties.Lat, o.result.properties.Lon ]
					);
			}
		});
	}
	
	public zoomLocation(): void {
		this._mapService.zoomLocation();
	}

}
