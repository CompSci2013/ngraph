import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import type { PlotlyHTMLElement } from 'plotly.js-dist-min';

@Component({
  selector: 'app-histogram',
  template: '<div class="plot" style="width: 100%; height: 100%;"></div>',
  styles: [':host { display: block; width: 100%; height: 100%; }'],
})
export class HistogramComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() plotData: any[] = [];
  @Input() plotLayout: any = {};

  @Output() clicked = new EventEmitter<string>();
  @Output() selected = new EventEmitter<string[]>();
  @Output() cleared = new EventEmitter<void>();

  private initialized = false;
  private resizeObserver!: ResizeObserver;

  private latestData: any[] = [];
  private latestLayout: any = {};
  private readyToRender = false;
  private visibleCheckFrame: number | null = null;

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.initialized = true;

    console.log('[Histogram] ngAfterViewInit called');

    this.resizeObserver = new ResizeObserver(() => {
      console.log('[Histogram] ResizeObserver triggered');
      Plotly.Plots.resize(this.getPlotElement());
    });
    this.resizeObserver.observe(this.getPlotElement());

    this.waitUntilVisibleAndReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plotData']) {
      this.latestData = this.plotData;
      console.log('[Histogram] plotData updated:', this.latestData);
    }
    if (changes['plotLayout']) {
      this.latestLayout = this.plotLayout;
      console.log('[Histogram] plotLayout updated:', this.latestLayout);
    }

    if (this.initialized && this.readyToRender) {
      console.log('[Histogram] ngOnChanges triggering renderPlot()');
      this.renderPlot();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.visibleCheckFrame) {
      cancelAnimationFrame(this.visibleCheckFrame);
    }
    Plotly.purge(this.getPlotElement());
  }

  private waitUntilVisibleAndReady(): void {
    const el = this.getPlotElement();
    if (!el) {
      console.warn('[Histogram] No plot element found');
      return;
    }

    const hasSize = el.offsetWidth > 0 && el.offsetHeight > 0;
    const hasData = this.latestData?.length > 0;
    const hasLayout =
      this.latestLayout && Object.keys(this.latestLayout).length > 0;

    console.log(
      `[Histogram] check size: ${el.offsetWidth}x${el.offsetHeight}, data: ${hasData}, layout: ${hasLayout}`
    );

    if (hasSize && hasData && hasLayout) {
      console.log('[Histogram] Conditions met, rendering now');
      this.readyToRender = true;
      this.renderPlot();
      this.setupEventListeners();
    } else {
      this.visibleCheckFrame = requestAnimationFrame(() =>
        this.waitUntilVisibleAndReady()
      );
    }
  }

  private renderPlot(): void {
    console.log(
      '[Histogram] Calling Plotly.newPlot() with:',
      this.latestData,
      this.latestLayout
    );
    Plotly.newPlot(this.getPlotElement(), this.latestData, this.latestLayout, {
      responsive: true,
    });
  }

  private getPlotElement(): HTMLElement {
    return this.elRef.nativeElement.querySelector('.plot');
  }

  private setupEventListeners(): void {
    const plotEl = this.getPlotElement() as PlotlyHTMLElement;

    plotEl.on('plotly_click', (eventData: any) => {
      const point = eventData?.points?.[0];
      if (point?.x) {
        this.clicked.emit(point.x);
      }
    });

    plotEl.on('plotly_selected', (eventData: any) => {
      const xValues = eventData?.points?.map((pt: any) => pt.x) ?? [];
      this.selected.emit(xValues);
    });

    plotEl.on('plotly_deselect', () => {
      this.cleared.emit();
    });
  }
}
