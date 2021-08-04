import { Component, Input, OnInit } from '@angular/core';
import { MapService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  currentClick!: object;

  constructor(private _mapService: MapService) { }

  ngOnInit(): void {
    this._mapService.clickPoint.subscribe((point: object) => {
			this.currentClick = point; 
		});
  }

}
