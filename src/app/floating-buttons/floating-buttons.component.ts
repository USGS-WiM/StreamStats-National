import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';

@Component({
  selector: 'app-floating-buttons',
  templateUrl: './floating-buttons.component.html',
  styleUrls: ['./floating-buttons.component.scss']
})
export class FloatingButtons implements OnInit {
	
	popout = '';

  	constructor(private _mapService: MapService) { }

  	ngOnInit(): void {  
  	}

}
