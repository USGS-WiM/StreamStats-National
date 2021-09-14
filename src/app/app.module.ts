import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import {ToastrModule, ToastNoAnimation, ToastNoAnimationModule} from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SidebarLeftComponent } from './sidebar-left/sidebar-left.component';
import { SidebarRightComponent } from './sidebar-right/sidebar-right.component';
import { MapComponent } from './map/map.component';
import { CenterBottomContentComponent } from './center-bottom-content/center-bottom-content.component';

import { AppService } from './shared/services/app.service';
import { ConfigService } from './shared/config/config.service';
import { WorkflowService } from './shared/services/workflow.service';
import { environment } from 'src/environments/environment';
import { ActiveComponentDirective } from './shared/directives/active-component.directive';

import { ReportComponent } from './sidebar-right/components-right/report/report.component';
import { AboutComponent } from './sidebar-right/components-right/about/about.component';
import { WorkflowComponent } from './center-bottom-content/components-bottom/report-builder/workflow/workflow.component';
import { MapOptionsComponent } from './center-bottom-content/components-bottom/map-options/map-options.component';
import { DiscoverComponent } from './center-bottom-content/components-bottom/discover/discover.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { WorkflowSelectionComponent } from './center-bottom-content/components-bottom/report-builder/workflow-selection/workflow-selection.component';
import { ValidatorsDirective } from './shared/directives/validators.directive';

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
    WorkflowSelectionComponent,
    ValidatorsDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ToastNoAnimationModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      progressAnimation:'decreasing',
      preventDuplicates: true,
      countDuplicates:true
    }),
    ReactiveFormsModule
  ],
  providers: [
    AppService,
    ConfigService,
    WorkflowService,
    { provide: APP_INITIALIZER, useFactory: ConfigLoader, deps: [ConfigService], multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
