import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
