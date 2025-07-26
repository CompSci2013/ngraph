import { Component, OnInit } from '@angular/core';
import { DataService, SalesRecord } from '../../services/data.services';
import { EventBusService } from '../../services/event-bus-service';

@Component({
  selector: 'app-date-sales-panel',
  templateUrl: './date-sales-panel.component.html',
  styleUrls: ['./date-sales-panel.component.css'],
})
export class DateSalesPanelComponent implements OnInit {
  plotData: any[] = [];
  plotLayout: any = {};

  constructor(
    private dataService: DataService,
    private eventBus: EventBusService
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
    });
  }

  // --- PATCH START: Emit 'selected' for single click ---
  onClicked(date: string): void {
    console.log('[Date Panel] emitting selected:', date);
    this.eventBus.emit({
      type: 'selected',
      panelId: 'date-sales',
      message: date,
    });
  }
  // --- PATCH END ---

  // --- PATCH START: Emit 'selected' for multi-selection (box drag) ---
  onSelected(dates: string[]): void {
    console.log('[Date Panel] emitting selected:', dates);
    this.eventBus.emit({
      type: 'selected',
      panelId: 'date-sales',
      message: JSON.stringify(dates),
    });
  }
  // --- PATCH END ---

  onCleared(): void {
    this.eventBus.emit({ type: 'message', panelId: 'filter', message: '' });
  }

  onZoomed(range: [string, string]): void {
    this.eventBus.emit({
      type: 'message',
      panelId: 'zoom',
      message: JSON.stringify(range),
    });
  }
}
