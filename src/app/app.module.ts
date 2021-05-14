import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SidebarLeftComponent } from './sidebar-left/sidebar-left.component';
import { SidebarRightComponent } from './sidebar-right/sidebar-right.component';
import { MapComponent } from './map/map.component';
import { CenterBottomContentComponent } from './center-bottom-content/center-bottom-content.component';

import { AppService } from './shared/services/app.service';
import { ComponentService } from './shared/services/component.service';
import { ConfigService } from './shared/config/config.service';
import { WorkflowService } from './shared/services/workflow.service';
import { environment } from 'src/environments/environment';
import { ActiveComponentDirective } from './shared/directives/active-component.directive';

import { ReportComponent } from './sidebar-right/components-right/report/report.component';
import { AboutComponent } from './sidebar-right/components-right/about/about.component';
import { WorkflowComponent } from './center-bottom-content/components-bottom/report/workflow/workflow.component';
import { MapOptionsComponent } from './center-bottom-content/components-bottom/map-options/map-options.component';
import { DiscoverComponent } from './center-bottom-content/components-bottom/discover/discover.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { ReportBuilderComponent } from './center-bottom-content/components-bottom/report/report-builder/report-builder.component';



export function ConfigLoader(configService: ConfigService) {
  return () => configService.loadConfig(environment.configFile);
}

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    SidebarLeftComponent,
    SidebarRightComponent,
    MapComponent,
    CenterBottomContentComponent,
    ActiveComponentDirective,
    ReportComponent,
    AboutComponent,
    WorkflowComponent,
    MapOptionsComponent,
    DiscoverComponent,
    LoaderComponent,
    ReportBuilderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [
    AppService,
    ConfigService, 
    ComponentService,
    WorkflowService,
    { provide: APP_INITIALIZER, useFactory: ConfigLoader, deps: [ConfigService], multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
