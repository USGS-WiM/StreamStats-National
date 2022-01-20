import { Component, OnInit, ViewChildren } from '@angular/core';
import { MapService } from 'src/app/shared/services/map.service';
declare let search_api: any;
import * as L from 'leaflet';
import { ConfigService } from '../shared/config/config.service';
import { Config } from '../shared/interfaces/config/config';
import { WorkflowService } from '../shared/services/workflow.service';
// import { ConsoleReporter } from 'jasmine';

@Component({
	selector: 'app-sidebar-left',
	templateUrl: './sidebar-left.component.html',
	styleUrls: ['./sidebar-left.component.scss']
})
export class SidebarLeftComponent implements OnInit {

	@ViewChildren("overlayCheckbox") overlayCheckbox: any;

	popout = '';
	bottomPopout = '';
	title = 'StreamStats-National';
	private MapService: MapService;
	private configSettings: Config;
	public baselayers = [] as any;
	public workflowLayers;
	public overlayLayers;
	public currentZoom: number = 4;
	public selectedWorkflow: any;

  	constructor(private _mapService: MapService, private _configService: ConfigService, private _workflowService: WorkflowService) {
		this.MapService = _mapService;
		this.configSettings = this._configService.getConfiguration();
	  }

	ngOnInit(): void {
		
		// Set up basemap list
		for (const baseMap in this.MapService.baseMaps) {
			this.baselayers.push([baseMap, baseMap.replace(' ','').toLowerCase() + ".jpg"]);
		}
		// Set up workflowLayers list for layers turned on as part of workflow
		this.MapService.activeWorkflowLayers.subscribe(layer => {
			this.workflowLayers = layer; 
		});
		// Get current zoom level
		this.MapService.currentZoomLevel.subscribe((zoom: number) => {
			this.currentZoom = zoom;
		});
		// Set up overlay layers list
		this.MapService.overlayLayers.subscribe((layer: any) => {
			this.overlayLayers = layer;
		})
		// Get current workflow
		this._workflowService.selectedWorkflow.subscribe(res => {
			this.selectedWorkflow = res;
		})

	}

	public SetBaselayer(LayerName: string) {
		this.MapService.SetBaselayer(LayerName);
	}

	public setOverlayLayer(layerName: string) {
		this.MapService.setOverlayLayer(layerName)
		this.overlayCheckbox.toArray().map((element: { nativeElement: { id: string; }; }) => {
			if(element.nativeElement.id === layerName) {
				this.MapService.setStreamgageLayerStatus(element)
			}
		});
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
