import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { DataService, SalesRecord } from '../../services/data.services';
import { EventBusService } from '../../services/event-bus-service';
import { HistogramComponent } from '../../components/histogram.component';

@Component({
  selector: 'app-product-sales-panel',
  templateUrl: './product-sales-panel.component.html',
  styleUrls: ['./product-sales-panel.component.css'],
})
export class ProductSalesPanelComponent implements OnInit, AfterViewInit {
  plotData: any[] = [];
  plotLayout: any = {};
  salesRecords: SalesRecord[] = [];

  @ViewChild(HistogramComponent) histogram!: HistogramComponent;

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

      this.plotLayout = {
        title: 'Sales by Product',
        xaxis: { title: 'Product' },
        yaxis: { title: 'Number of Sales' },
        margin: { t: 40, l: 50, r: 30, b: 60 },
      };
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

  ngAfterViewInit(): void {
    // Trigger the plot update explicitly after ViewChild is available
    this.dataService.getSalesData().subscribe(() => {
      this.histogram.plotData = this.plotData;
      this.histogram.plotLayout = this.plotLayout;
      this.histogram.refreshPlot(); // <-- Changed to public method
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

  onHovered(product: string): void {
    this.eventBus.emit({ type: 'message', panelId: 'all', message: product });
  }

  onClicked(product: string): void {
    this.eventBus.emit({
      type: 'message',
      panelId: 'filter',
      message: product,
    });
  }

  onSelected(products: string[]): void {
    this.eventBus.emit({
      type: 'message',
      panelId: 'multi-filter',
      message: JSON.stringify(products),
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
