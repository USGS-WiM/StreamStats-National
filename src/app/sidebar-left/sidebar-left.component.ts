import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/shared/services/map.service';
declare let search_api: any;
import * as L from 'leaflet';
// import { ConsoleReporter } from 'jasmine';

@Component({
	selector: 'app-sidebar-left',
	templateUrl: './sidebar-left.component.html',
	styleUrls: ['./sidebar-left.component.scss']
})
export class SidebarLeftComponent implements OnInit {

	popout = '';
	popoutLayers = '';
	discoverTab = '';
	title = 'StreamStats-National';
	private MapService: MapService;
	public baselayers = [] as any;
	public workflowLayers;
	public overlays = [] as any;

  	constructor(private _mapService: MapService) {
		this.MapService = _mapService;
	  }

	ngOnInit(): void {
		
		// Set up basemap list
		for (const baseMap in this.MapService.baseMaps) {
			this.baselayers.push([baseMap, baseMap.replace(' ','').toLowerCase() + ".jpg"]);
		}
		// Set up workflowLayers list for layers turned on as part of workflow
		this.MapService.activeWorkflowLayers.subscribe(layer => {
			console.log(layer)
			this.workflowLayers = layer; 
		});

	}

	public SetBaselayer(LayerName: string) {
		this.MapService.SetBaselayer(LayerName);
	}

	public updateActiveLayer(layerName: string) {
		this.MapService.toggleWorkflowLayers(layerName);
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
				}
			});
		});
	}

	public zoomLocation(): void {
		this.MapService.zoomLocation();
	}

}
