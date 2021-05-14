import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  // component communication between sidebar right and report component
  @Input() clickPoint!: object;

  constructor() { }

  ngOnInit(): void {
  }

}
