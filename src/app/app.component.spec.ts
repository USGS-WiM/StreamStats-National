import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule} from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ContentRightComponent } from './content-right/content-right.component';
import { MapComponent } from './map/map.component';
import { ToastrModule } from 'ngx-toastr';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        ToastrModule.forRoot()
      ],
      declarations: [
        AppComponent,
        TopBarComponent,
        ContentRightComponent,
        MapComponent,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'StreamStats-National'`, () => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    expect(app.title).toEqual('StreamStats-National');
  });

});
