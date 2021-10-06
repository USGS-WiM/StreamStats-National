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
});
