import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { DataService, SalesRecord } from '../../services/data.services';
import { EventBusService } from '../../services/event-bus-service';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-date-sales-panel',
  templateUrl: './date-sales-panel.component.html',
  styleUrls: ['./date-sales-panel.component.css'],
})
export class DateSalesPanelComponent implements OnInit, AfterViewInit {
  plotData: any[] = [];
  plotLayout: any = {};

  private resizeObserver!: ResizeObserver;

  constructor(
    private dataService: DataService,
    private eventBus: EventBusService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.dataService.getSalesData().subscribe((records: SalesRecord[]) => {
      const aggregated = records.reduce((acc, curr) => {
        acc[curr.date] =
          (acc[curr.date] || 0) +
          curr.red +
          curr.yellow +
          curr.white +
          curr.blue;
        return acc;
      }, {} as { [key: string]: number });

      this.plotData = [
        {
          x: Object.keys(aggregated),
          y: Object.values(aggregated),
          type: 'bar',
          marker: { color: '#4c78a8' },
          hoverinfo: 'x+y',
          hovertemplate: 'Date: %{x}<br>Sales: %{y}<extra></extra>',
        },
      ];

      this.plotLayout = {
        title: 'Sales by Date',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Number of Sales' },
        margin: { t: 40, l: 50, r: 30, b: 60 },
      };

      Plotly.newPlot(
        this.el.nativeElement.firstChild,
        this.plotData,
        this.plotLayout,
        { responsive: true }
      );
    });
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      Plotly.Plots.resize(this.el.nativeElement.firstChild);
    });

    this.resizeObserver.observe(this.el.nativeElement);
  }

  onHovered(date: string): void {
    this.eventBus.emit({ type: 'message', panelId: 'all', message: date });
  }

  onClicked(date: string): void {
    this.eventBus.emit({ type: 'message', panelId: 'filter', message: date });
  }

  onSelected(dates: string[]): void {
    this.eventBus.emit({
      type: 'message',
      panelId: 'multi-filter',
      message: JSON.stringify(dates),
    });
  }

  onZoomed(range: [string, string]): void {
    this.eventBus.emit({
      type: 'message',
      panelId: 'zoom',
      message: JSON.stringify(range),
    });
  }

  onCleared(): void {
    this.eventBus.emit({ type: 'message', panelId: 'filter', message: '' });
  }
}
