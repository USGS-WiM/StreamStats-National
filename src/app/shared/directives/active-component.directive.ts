// Anchor directive: Helper directive to mark valid insertion points into the template
// TODO: may or may not use this directive, keeping it here for now

import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appActiveComponent]'
})
export class ActiveComponentDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
