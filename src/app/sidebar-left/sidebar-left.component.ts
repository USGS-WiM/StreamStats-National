import { Component, OnInit } from '@angular/core';
import { AppService } from '../shared/services/app.service';

@Component({
  selector: 'app-sidebar-left',
  templateUrl: './sidebar-left.component.html',
  styleUrls: ['./sidebar-left.component.scss']
})
export class SidebarLeftComponent implements OnInit {

	popout = '';
	showHideReport!: boolean;

	title = 'StreamStats-National';

  	constructor(private _appService: AppService) { }

	ngOnInit(): void {
	}

	public showHideReportBuilder() {
		this.showHideReport = !this.showHideReport;
		if (!this.showHideReport) {
			this._appService.setReportBuilder(false);
		} else {
			this._appService.setWorkflowComponent(false);
			this._appService.setReportBuilder(true);
		}
	}

}
