import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { DataService, SalesRecord } from '../../services/data.services';
import { map } from 'rxjs/operators';
import { EventBusService } from '../../services/event-bus-service';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-company-sales-panel',
  templateUrl: './company-sales-panel.component.html',
  styleUrls: ['./company-sales-panel.component.css'],
})
export class CompanySalesPanelComponent implements OnInit, AfterViewInit {
  plotData: any[] = [];
  plotLayout: any = {};
  salesRecords: SalesRecord[] = []; // explicitly store data locally

  private resizeObserver!: ResizeObserver;

  constructor(
    private dataService: DataService,
    private eventBus: EventBusService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    // Load data only once explicitly
    this.dataService.getSalesData().subscribe((records) => {
      this.salesRecords = records; // store clearly in local variable

      const aggregated = records.reduce(
        (acc: { [key: string]: number }, curr: SalesRecord) => {
          const total = curr.red + curr.yellow + curr.white + curr.blue;
          acc[curr.company] = (acc[curr.company] || 0) + total;
          return acc;
        },
        {}
      );

      this.plotData = [
        {
          x: Object.keys(aggregated),
          y: Object.values(aggregated),
          type: 'bar',
          marker: { color: '#f58518' },
          hoverinfo: 'x+y',
          hovertemplate: 'Company: %{x}<br>Sales: %{y}<extra></extra>',
        },
      ];

      this.plotLayout = {
        title: 'Sales by Company',
        xaxis: { title: 'Company' },
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

    // Listen explicitly for hover events
    this.eventBus.on().subscribe((event) => {
      console.log('[CompanySales]', event);
      if (event.type === 'message') {
        const hoveredDate = event.message;
        console.log(hoveredDate);
        if (hoveredDate) {
          this.highlightSalesByDate(hoveredDate);
        } else {
          this.clearHighlight();
        }
      }
    });
  }

  highlightSalesByDate(date: string): void {
    // Explicitly use locally stored data (no new subscription)
    const aggregated = this.salesRecords
      .filter((record) => record.date === date)
      .reduce((acc, curr) => {
        const total = curr.red + curr.yellow + curr.white + curr.blue;
        acc[curr.company] = (acc[curr.company] || 0) + total;
        return acc;
      }, {} as { [key: string]: number });

    const highlightedCompanies = Object.keys(aggregated);

    const plotElement = document.querySelector(
      'app-company-sales-panel app-plotly-chart .plotly-chart'
    ) as HTMLElement;

    if (plotElement) {
      Plotly.restyle(plotElement, {
        marker: {
          color: this.plotData[0].x.map((company: string) =>
            highlightedCompanies.includes(company) ? '#f58518' : '#d9d9d9'
          ),
        },
      });
      console.log('Highlighed', highlightedCompanies);
    }
  }

  clearHighlight(): void {
    console.log('Clearing highlights');
    const plotElement = document.querySelector(
      'app-company-sales-panel app-plotly-chart .plotly-chart'
    ) as HTMLElement;

    if (plotElement) {
      Plotly.restyle(plotElement, { marker: { color: '#f58518' } });
    }
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
