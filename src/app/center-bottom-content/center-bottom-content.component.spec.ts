import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterBottomContentComponent } from './center-bottom-content.component';

describe('CenterBottomContentComponent', () => {
  let component: CenterBottomContentComponent;
  let fixture: ComponentFixture<CenterBottomContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CenterBottomContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterBottomContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
