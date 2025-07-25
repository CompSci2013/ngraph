import {
  Component,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Input,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-plotly-chart',
  template: `<div class="plotly-chart"></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .plotly-chart {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class PlotlyChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() data: Plotly.Data[] = [];
  @Input() layout: Partial<Plotly.Layout> = {};
  @Input() config?: Partial<Plotly.Config>;

  private resizeObserver!: ResizeObserver;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.plotChart();

    // Explicitly use ResizeObserver to detect DOM changes clearly:
    this.resizeObserver = new ResizeObserver(() => {
      Plotly.Plots.resize(this.el.nativeElement.firstChild);
    });

    this.resizeObserver.observe(this.el.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['layout']) {
      this.plotChart();
    }
  }

  plotChart(): void {
    const responsiveLayout = {
      autosize: true,
      margin: { t: 40, b: 40, l: 40, r: 40 },
      ...this.layout,
    };

    const responsiveConfig = {
      responsive: true,
      ...this.config,
    };

    Plotly.newPlot(
      this.el.nativeElement.firstChild,
      this.data,
      responsiveLayout,
      responsiveConfig
    );
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }
}
