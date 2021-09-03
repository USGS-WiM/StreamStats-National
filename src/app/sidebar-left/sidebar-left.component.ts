import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/shared/services/map.service';
declare let search_api: any;
import * as L from 'leaflet';

@Component({
	selector: 'app-sidebar-left',
	templateUrl: './sidebar-left.component.html',
	styleUrls: ['./sidebar-left.component.scss']
})
export class SidebarLeftComponent implements OnInit {

	popout = '';
	discoverTab = '';
	title = 'StreamStats-National';
	private MapService: MapService;
	public baselayers = [] as any;
	public overlays = [] as any;

  	constructor(private _mapService: MapService) {
		this.MapService = _mapService;
	  }

	ngOnInit(): void {

		this.MapService.LayersControl.subscribe(data => {
			if (this.overlays.length > 0 || this.baselayers.length > 0) {
			  this.overlays = [];
			  this.baselayers = [];
			}
			this.overlays = data.overlays;
			this.baselayers = data.baseLayers;
		  });
	}

	public SetBaselayer(LayerName: string) {
		this.MapService.SetBaselayer(LayerName);
	}

	// Remove the existing basemap and add the newly selected basemap
	public toggleBasemap(selectedBase: string) {
		console.log(this.MapService);
		this.MapService.map.removeLayer(this.MapService.baseMaps[this.MapService.chosenBaseLayer ]);
		this.MapService.chosenBaseLayer = selectedBase;
		this.MapService.map.addLayer(this.MapService.baseMaps[selectedBase]);
	}

	public geosearch(): void {
		setTimeout(() => {
			search_api.create( "searchBox", {
				include_usgs_sw    : true,  // surface water
				include_usgs_gw    : true,  // ground water
				include_usgs_sp    : true,  // spring
				include_usgs_at    : true,  // atmospheric
				include_usgs_ot    : true,  // other
				on_result: (o: any) => {
					// Define the marker icon
					var redCircle = L.divIcon({className: 'wmm-circle wmm-red wmm-icon-triangle wmm-icon-red wmm-size-25 wmm-borderless'});
					const marker = L.marker([o.result.properties.Lat, o.result.properties.Lon], {
						icon: redCircle,
						opacity: 0.7
					});
					this.MapService.AddMapLayer({ name: 'Search Location', layer: marker, visible: true });
					
					// addTo(this._mapService.map);
					// what to do when a location is found
					// o.result is geojson point feature of location with properties
					this.MapService.map
						.fitBounds([ // zoom to location
							[ o.result.properties.LatMin, o.result.properties.LonMin ],
							[ o.result.properties.LatMax, o.result.properties.LonMax ]
						])
						.setZoom(16);
						this.popout = '';
						
						// .openPopup(  // open popup at location listing all properties
						// 	this._mapService.map( Object.keys(o.result.properties), function(property: any) {
						// 		return "<b>" + property + ": </b>" + o.result.properties[property];
						// 	}).join("<br/>"),
						// 	[ o.result.properties.Lat, o.result.properties.Lon ]
						// );
				}
			});
		});
	}

	public zoomLocation(): void {
		this.MapService.zoomLocation();
	}

}
