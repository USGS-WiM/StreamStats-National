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
	discoverTab = '';
	title = 'StreamStats-National';
	private MapService: MapService;
	public baselayers = [] as any;
	public overlays = [] as any;

  	constructor(private _mapService: MapService) {
		this.MapService = _mapService;
	  }

	ngOnInit(): void {

		// this.MapService.LayersControl.subscribe(data => {
		// 	if (this.overlays.length > 0 || this.baselayers.length > 0) {
		// 	  this.overlays = [];
		// 	  this.baselayers = [];
		// 	}
		// 	this.overlays = data.overlays;
		// 	this.baselayers = data.baseLayers;
		//   });
		// this.baselayers = this.MapService.baseMaps;
		// console.log(this.baselayers);

		// var obj = {"1":5,"2":7,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0}
		// var result = Object.keys(this.MapService.baseMaps).map((key) => [this.MapService.baseMaps[key]]);
		// var result2 = Object.entries(this.MapService.baseMaps);
		// console.log(result2);
		// for (const val of result) { // You can use `let` instead of `const` if you like
		// 	// console.log(val["name"]);
		// }

		// objectArray.forEach(([key, value]) => {
		// 	console.log(key); // 'one'
		// 	console.log(value); // 1
		//   });

		// var baselayers = [];
		// for (var i = 0; i < this.MapService.baseMaps.length; i++) {
		// 		console.log(this.MapService.baseMaps[i].name);
		// 		baselayers.push(this.MapService.baseMaps[i].name);
		// }

		// console.log(this.MapService.baseMaps);
		// console.log(typeof(this.MapService.baseMaps));
		// for (var baseMap in this.MapService.baseMaps) {
		// 	console.log(baseMap);
		// 	console.log(baseMap);
		// }

		// var obj = {a: 1, b: 2};
		// for (var key in this.MapService.baseMaps) {
		// 	if (this.MapService.baseMaps.hasOwnProperty(key)) {
		// 		var val = this.MapService.baseMaps[key];
		// 		// console.log(val);
		// 		this.baselayers.push([val.name, val.img]);
		// 	}
			
		// 	console.log(this.baselayers);
		// }

		for (const baseMap in this.MapService.baseMaps) {
			// console.log(baseMap);
			this.baselayers.push([baseMap, baseMap.replace(' ','').toLowerCase() + ".jpg"]);
		}
		// console.log(this.baselayers);
	}

	public SetBaselayer(LayerName: string) {
		this.MapService.SetBaselayer(LayerName);
	}

	// Remove the existing basemap and add the newly selected basemap
	public toggleBasemap(selectedBase: string) {
		console.log(this.MapService);
		// this.MapService.map.removeLayer(this.MapService.baseMaps[this.MapService.chosenBaseLayer ]);
		this.MapService.chosenBaseLayer = selectedBase;
		// this.MapService.map.addLayer(this.MapService.baseMaps[selectedBase]);
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
