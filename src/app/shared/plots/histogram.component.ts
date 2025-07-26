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

  // --- PATCH START: track latest inputs ---
  private latestData: any[] = [];
  private latestLayout: any = {};
  // --- PATCH END ---

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.initialized = true;

    // --- PATCH START: Wait for container to be visible and sized ---
    const waitForVisibleSize = () => {
      const el = this.getPlotElement();
      if (el?.offsetWidth > 0 && el?.offsetHeight > 0) {
        this.renderPlot();
        this.setupEventListeners();
      } else {
        requestAnimationFrame(waitForVisibleSize);
      }
    };
    requestAnimationFrame(waitForVisibleSize);
    // --- PATCH END ---

    this.resizeObserver = new ResizeObserver(() => {
      Plotly.Plots.resize(this.getPlotElement());
    });
    this.resizeObserver.observe(this.getPlotElement());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // --- PATCH START: store inputs and allow future re-render ---
    if (changes['plotData']) {
      this.latestData = this.plotData;
    }
    if (changes['plotLayout']) {
      this.latestLayout = this.plotLayout;
    }

    if (this.initialized && (changes['plotData'] || changes['plotLayout'])) {
      this.renderPlot();
    }
    // --- PATCH END ---
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    Plotly.purge(this.getPlotElement());
  }

  // --- PATCH START: use stored inputs with fallback ---
  private renderPlot(): void {
    const data = this.latestData ?? [];
    const layout = this.latestLayout ?? {};
    Plotly.newPlot(this.getPlotElement(), data, layout, {
      responsive: true,
    });
  }
  // --- PATCH END ---

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
