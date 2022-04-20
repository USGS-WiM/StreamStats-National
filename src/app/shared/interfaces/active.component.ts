import { Type } from "@angular/core";

export interface ActiveComponent {
    data: any;
}

export class ComponentItem {
    constructor(public component: Type<any>) {}
}