import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterTopContentComponent } from './center-top-content.component';

describe('CenterTopContentComponent', () => {
  let component: CenterTopContentComponent;
  let fixture: ComponentFixture<CenterTopContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CenterTopContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterTopContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
