import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SidebarLeftComponent } from './sidebar-left/sidebar-left.component';
import { SidebarRightComponent } from './sidebar-right/sidebar-right.component';
import { MapComponent } from './map/map.component';
import { CenterBottomContentComponent } from './center-bottom-content/center-bottom-content.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    SidebarLeftComponent,
    SidebarRightComponent,
    MapComponent,
    CenterBottomContentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
