import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ MapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('it should show streamgage layer when zoomed past 8', () => {
  //   spyOn(component, 'getStreamgages');
  //   component.currentZoom = 8;
  //   fixture.detectChanges();
  //   //console.log(component.currentZoom, component.getStreamgages(-104.04, -96.55,45.93,	49.00))
  //   expect(component.getStreamgages).toHaveBeenCalled();
  // });

  // it('layers should be cleared when zoomed to 8 or lower', () => {
  //   component._mapService.map.setZoom(8);
  //   fixture.detectChanges();
  //   expect(component._mapService.map.hasLayer(component.streamgageLayer)).toBeFalsy;
  // });

  // it('should #setClickPoint from map click event', () => {
  //   const click = {lat: 45, lng: -93};
  //   //mock click data
  //   component.clickPoint = {
  //     lat: 45,
  //     lng: -93
  //   };
  //   component.onMouseClick();
  //   //fixture.detectChanges();
  //   expect(component.clickPoint).toEqual(click)

  // });
});
