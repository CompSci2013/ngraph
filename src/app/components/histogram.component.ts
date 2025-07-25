import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { BasePlotComponent } from '../shared/plots/base-plot.component';
import { EventBusService } from '../services/event-bus-service';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-histogram',
  template: `<div
    class="histogram-chart"
    style="width:100%; height:100%;"
  ></div>`,
  styles: [':host { display: block; width: 100%; height: 100%; }'],
})
export class HistogramComponent
  extends BasePlotComponent
  implements AfterViewInit, OnDestroy
{
  plotSelector = '.histogram-chart';
  private resizeObserver!: ResizeObserver;

  constructor(
    protected override elRef: ElementRef,
    private eventBus: EventBusService
  ) {
    super(elRef);
  }

  ngAfterViewInit(): void {
    this.initializePlot(); // explicitly call BasePlotComponent method
    this.setupEventListeners(); // explicitly call BasePlotComponent method

    this.resizeObserver = new ResizeObserver(() => {
      Plotly.Plots.resize(
        this.elRef.nativeElement.querySelector(this.plotSelector)
      );
    });

    this.resizeObserver.observe(this.elRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  protected highlightItems(item: string): void {
    // Histogram-specific highlight logic here
  }

  protected clearHighlight(): void {
    // Histogram-specific clear highlight logic here
  }

  onClicked(date: string): void {
    this.eventBus.emit({ type: 'message', toPanelId: 'filter', message: date });
  }
}
