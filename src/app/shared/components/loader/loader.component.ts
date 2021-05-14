// Shared component: component that will sit in mapview.component/app.component, 
// loading div that can cover page until something can be displayed (geojson, etc.)

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
