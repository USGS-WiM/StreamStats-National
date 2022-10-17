import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../shared/services/app.service';
import { MapActionsComponent } from './map-actions.component';
import { ToastrModule } from 'ngx-toastr';

describe('MapActionsComponent', () => {
  let component: MapActionsComponent;
  let fixture: ComponentFixture<MapActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ToastrModule.forRoot()
      ],
      declarations: [ MapActionsComponent ],
      providers: [
        MapActionsComponent,
        { provide: AppService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the active layer', () => {
    let workflowLayerToggleSpy = spyOn(component["MapService"], "toggleWorkflowLayers");
    component.updateActiveLayer("Streamgages");

    expect(workflowLayerToggleSpy).toHaveBeenCalled();
  });

  it('should set an overlay layer', () => {
    // ViewChild is in ngIf, so need to be able to detect the element
    component.popout = 'layers';
    component.overlayLayers = [{name: "Streamgages", visible: true, layerOptions: {minZoom: 8}}];
    fixture.detectChanges();

    let setOverlaySpy = spyOn(component["MapService"], "setOverlayLayer");
    let streamgageSpy = spyOn(component["MapService"], "setStreamgageLayerStatus");
    component.setOverlayLayer("Streamgages");

    expect(setOverlaySpy).toHaveBeenCalled();
    expect(streamgageSpy).toHaveBeenCalled();
  });

/*   it('should call zoomLocation on geolocate button click', () => {
    let zoomLocationSpy = spyOn(component, 'zoomLocation');
    let geolocate = document.getElementById("geolocate");
    geolocate.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(zoomLocationSpy).toHaveBeenCalled();
  });

  it('should call geosearch on geosearch button click', () => {
    let geosearchSpy = spyOn(component, 'geosearch');
    let geosearch = document.getElementById("geosearch");
    geosearch.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(geosearchSpy).toHaveBeenCalled();
  }); */

  it('should call map service zoom location', () => {
    let zoomSpy = spyOn(component["MapService"], "zoomLocation");
    component.zoomLocation();
    expect(zoomSpy).toHaveBeenCalled();
  });

  it('should set baselayers', () => {
    let baseLayerSpy = spyOn(component["MapService"], "SetBaselayer");
    component.SetBaselayer("World Topographic");
    expect(baseLayerSpy).toHaveBeenCalledWith("World Topographic")
  });
});
