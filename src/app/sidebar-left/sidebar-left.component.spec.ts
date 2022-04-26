import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../shared/services/app.service';
import { SidebarLeftComponent } from './sidebar-left.component';
import { ToastrModule } from 'ngx-toastr';

describe('SidebarLeftComponent', () => {
  let component: SidebarLeftComponent;
  let fixture: ComponentFixture<SidebarLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ToastrModule.forRoot()
      ],
      declarations: [ SidebarLeftComponent ],
      providers: [
        SidebarLeftComponent,
        { provide: AppService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarLeftComponent);
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
});
