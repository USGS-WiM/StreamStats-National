import { NgModule, APP_INITIALIZER } from '@angular/core';
import {CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ToastrModule, ToastNoAnimation, ToastNoAnimationModule} from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ContentRightComponent } from './content-right/content-right.component';
import { MapComponent } from './map/map.component';
import { MapActionsComponent } from './map-actions/map-actions.component';

import { AppService } from './shared/services/app.service';
import { ConfigService } from './shared/config/config.service';
import { WorkflowService } from './shared/services/workflow.service';
import { environment } from 'src/environments/environment';
import { ActiveComponentDirective } from './shared/directives/active-component.directive';

import { ReportComponent } from './content-right/report/report.component';
import { WorkflowComponent } from './content-right/report-builder/workflow/workflow.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { WorkflowSelectionComponent } from './content-right/report-builder/workflow-selection/workflow-selection.component';
import { ValidatorsDirective } from './shared/directives/validators.directive';

export function ConfigLoader(configService: ConfigService) {
  return () => configService.loadConfig(environment.configFile);
}

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    ContentRightComponent,
    MapComponent,
    MapActionsComponent,
    ActiveComponentDirective,
    ReportComponent,
    WorkflowComponent,
    LoaderComponent,
    WorkflowSelectionComponent,
    ValidatorsDirective
  ],
  imports: [
    BrowserModule,
	CommonModule,
    HttpClientModule,
    AppRoutingModule,
    ToastNoAnimationModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      progressAnimation:'decreasing',
      preventDuplicates: true,
      countDuplicates:true
    }),
    FormsModule,
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
