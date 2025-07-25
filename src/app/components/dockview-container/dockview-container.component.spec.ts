import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DockviewContainerComponent } from './dockview-container.component';

describe('DockviewContainerComponent', () => {
  let component: DockviewContainerComponent;
  let fixture: ComponentFixture<DockviewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DockviewContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DockviewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
