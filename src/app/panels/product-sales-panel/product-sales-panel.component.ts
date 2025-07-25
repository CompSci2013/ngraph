import { Component, OnInit } from '@angular/core';
import { DataService, SalesRecord } from '../../services/data.services';
import { map } from 'rxjs/operators';
import { EventBusService } from '../../services/event-bus-service';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-product-sales-panel',
  templateUrl: './product-sales-panel.component.html',
  styleUrls: ['./product-sales-panel.component.css'],
})
export class ProductSalesPanelComponent implements OnInit {
  plotData: any[] = [];
  plotLayout: any = {};
  salesRecords: SalesRecord[] = []; // explicitly store data locally

  constructor(
    private dataService: DataService,
    private eventBus: EventBusService
  ) {}

  ngOnInit(): void {
    // Load data explicitly once and store locally
    this.dataService.getSalesData().subscribe((records) => {
      this.salesRecords = records;

      const aggregated = { red: 0, yellow: 0, white: 0, blue: 0 };
      records.forEach((curr) => {
        aggregated.red += curr.red;
        aggregated.yellow += curr.yellow;
        aggregated.white += curr.white;
        aggregated.blue += curr.blue;
      });

      this.plotData = [
        {
          x: Object.keys(aggregated),
          y: Object.values(aggregated),
          type: 'bar',
          marker: { color: '#54a24b' },
          hoverinfo: 'x+y',
          hovertemplate: 'Product: %{x}<br>Sales: %{y}<extra></extra>',
        },
      ];

      this.plotLayout = {
        title: 'Sales by Product',
        xaxis: { title: 'Product' },
        yaxis: { title: 'Number of Sales' },
        margin: { t: 40, l: 50, r: 30, b: 60 },
      };
    });

    // Explicitly subscribe to hover events
    this.eventBus.on().subscribe((event) => {
      if (event.type === 'message') {
        const hoveredDate = event.message;
        if (hoveredDate) {
          this.highlightSalesByDate(hoveredDate);
        } else {
          this.clearHighlight();
        }
      }
    });
  }

  highlightSalesByDate(date: string): void {
    // Explicitly use locally stored data for highlighting
    const salesOnDate = this.salesRecords.filter(
      (record) => record.date === date
    );

    const aggregated = { red: 0, yellow: 0, white: 0, blue: 0 };
    salesOnDate.forEach((curr) => {
      aggregated.red += curr.red;
      aggregated.yellow += curr.yellow;
      aggregated.white += curr.white;
      aggregated.blue += curr.blue;
    });

    const productsSold = Object.keys(aggregated).filter(
      (product) => aggregated[product as keyof typeof aggregated] > 0
    );

    const plotElement = document.querySelector(
      'app-product-sales-panel app-plotly-chart .plotly-chart'
    ) as HTMLElement;

    if (plotElement) {
      Plotly.restyle(plotElement, {
        marker: {
          color: this.plotData[0].x.map((product: string) =>
            productsSold.includes(product) ? '#54a24b' : '#d9d9d9'
          ),
        },
      });
    }
  }

  clearHighlight(): void {
    const plotElement = document.querySelector(
      'app-product-sales-panel app-plotly-chart .plotly-chart'
    ) as HTMLElement;

    if (plotElement) {
      Plotly.restyle(plotElement, { marker: { color: '#54a24b' } });
    }
  }
}
