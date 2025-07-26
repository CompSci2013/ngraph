import { Component, OnInit } from '@angular/core';
import { DataService, SalesRecord } from '../../services/data.services';
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
  salesRecords: SalesRecord[] = [];

  constructor(
    private dataService: DataService,
    private eventBus: EventBusService
  ) {}

  ngOnInit(): void {
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
      console.log('[DEBUG] plotData:', this.plotData);

      // --- PATCH START: Explicit axis typing for Plotly ---
      this.plotLayout = {
        title: 'Sales by Product',
        xaxis: {
          title: 'Product',
          type: 'category',
        },
        yaxis: {
          title: 'Number of Sales',
          rangemode: 'tozero',
        },
        margin: { t: 40, l: 50, r: 30, b: 60 },
      };
      // --- PATCH END ---
    });

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

    this.eventBus.emit({
      type: 'highlight',
      panelId: 'product-sales-panel',
      message: JSON.stringify(productsSold),
    });
  }

  clearHighlight(): void {
    this.eventBus.emit({
      type: 'clearHighlight',
      panelId: 'product-sales-panel',
      message: '',
    });
  }

  // These handlers are retained for template compatibility or future use
  onHovered(product: string): void {}
  onClicked(product: string): void {}
  onSelected(products: string[]): void {}
  onZoomed(range: [string, string]): void {}
  onCleared(): void {}
}
