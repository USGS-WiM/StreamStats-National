// Anchor directive: Helper directive to mark valid insertion points into the template

import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appActiveComponent]'
})
export class ActiveComponentDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
