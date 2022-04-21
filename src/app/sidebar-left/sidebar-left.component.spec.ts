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

  it('should call zoomLocation on geolocate button click', () => {
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
  });

  it('should set baselayers', () => {
    let baseLayerSpy = spyOn(component["MapService"], "SetBaselayer");
    component.SetBaselayer("World Topographic");
    expect(baseLayerSpy).toHaveBeenCalledWith("World Topographic")
  });
});
