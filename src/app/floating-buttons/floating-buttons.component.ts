import { Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';
import { WorkflowService } from 'src/app/shared/services/workflow.service';

@Component({
  selector: 'app-floating-buttons',
  templateUrl: './floating-buttons.component.html',
  styleUrls: ['./floating-buttons.component.scss']
})
export class FloatingButtons implements OnInit {
	public workflowData: any;
	
	popout = '';

  	constructor(private _workflowService: WorkflowService, private _mapService: MapService) { }

	ngOnInit(): void {
		this._workflowService.completedData.subscribe(data => {
			this.workflowData = data;
		});
	}


}
