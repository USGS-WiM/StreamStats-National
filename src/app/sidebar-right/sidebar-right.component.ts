import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';

@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html',
  styleUrls: ['./sidebar-right.component.scss']
})
export class SidebarRightComponent implements OnInit {
	
	popout = '';

  	constructor(private _mapService: MapService) { }

  	ngOnInit(): void {  
  	}

}
