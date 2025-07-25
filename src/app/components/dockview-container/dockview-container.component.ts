import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { DockviewComponent } from 'dockview-core';
import { DockviewApi } from 'dockview-core/dist/cjs/api/component.api';
import { IContentRenderer } from 'dockview-core/dist/cjs/dockview/types';
import { DockviewService } from '../../services/dockview.service';
import { RendererRegistryService } from '../../services/render-registry.service';
export class DockviewDefaultTabRenderer {}

@Component({
  selector: 'adv-dockview-container',
  templateUrl: './dockview-container.component.html',
  styleUrls: ['./dockview-container.component.css'],
})
export class DockviewContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) hostElementRef!: ElementRef<HTMLElement>;
  @Input() theme: string = '';
  @Output() initialized = new EventEmitter<DockviewApi>();

  constructor(private dockviewService: DockviewService) {}

  ngAfterViewInit(): void {
    const api = this.dockviewService.initialize(
      this.hostElementRef.nativeElement,
      this.theme
    );
    this.initialized.emit(api);
  }

  ngOnDestroy(): void {
    this.dockviewService.dispose();
  }

  public addPanel(config: any): void {
    this.dockviewService.addPanel(config);
  }

  public focusPanel(id: string): void {
    this.dockviewService.focusPanel(id);
  }
}
