import { Component, OnInit } from '@angular/core';
import { DataService, SalesRecord } from '../../services/data.services';
import { map, filter } from 'rxjs/operators';
import {
  EventBusService,
  DockviewEvent,
} from '../../services/event-bus-service';

@Component({
  selector: 'app-company-sales-panel',
  templateUrl: './company-sales-panel.component.html',
  styleUrls: ['./company-sales-panel.component.css'],
})
export class CompanySalesPanelComponent implements OnInit {
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
      this.renderFullChart();
    });

    // --- PATCH START: EventBus subscriptions ---
    this.eventBus
      .on()
      .pipe(
        filter((e) => e.type === 'highlight' && e.panelId !== 'company-sales')
      )
      .subscribe((event) => {
        this.applyHighlight(event);
      });

    this.eventBus
      .on()
      .pipe(filter((e) => e.type === 'clearHighlight'))
      .subscribe(() => {
        this.clearHighlight();
      });

    this.eventBus
      .on()
      .pipe(filter((e) => e.type === 'selected' && !!e.message))
      .subscribe((event) => {
        this.filterByDateMessage(event.message!);
      });
    // --- PATCH END ---
  }

  renderFullChart(): void {
    this.plotData = [
      {
        x: this.salesRecords.map((r) => r.company),
        y: this.salesRecords.map((r) => r.red + r.yellow + r.white + r.blue),
        type: 'bar',
        marker: { color: 'steelblue' },
      },
    ];
    this.plotLayout = { title: 'Sales by Company' };
  }

  // --- PATCH START: Flexible message-based filtering ---
  filterByDateMessage(message: string): void {
    let selectedDates: string[];

    try {
      const parsed = JSON.parse(message);
      selectedDates = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      selectedDates = [message];
    }

    const filtered = this.salesRecords.filter((r) =>
      selectedDates.includes(r.date)
    );

    this.plotData = [
      {
        x: filtered.map((r) => r.company),
        y: filtered.map((r) => r.red + r.yellow + r.white + r.blue),
        type: 'bar',
        marker: { color: 'seagreen' },
      },
    ];
    this.plotLayout = {
      title: `Sales by Company on ${selectedDates.join(', ')}`,
    };
  }
  // --- PATCH END ---

  onZoomed(event: any): void {
    console.log('Zoom event:', event);
  }

  onCleared(): void {
    console.log('Clear interaction received');
    this.eventBus.emit({ type: 'clearHighlight' });
  }

  onBarClicked(point: any): void {
    const label = point.label || point.x;
    this.eventBus.emit({
      type: 'highlight',
      panelId: 'company-sales',
      message: label,
    });
  }

  onHovered(event: any): void {
    console.log('Hovered event:', event);
  }

  onClicked(event: any): void {
    console.log('Clicked event:', event);
  }

  onSelected(event: any): void {
    console.log('Selected event:', event);
  }

  applyHighlight(event: DockviewEvent): void {
    console.log('Highlight received in company panel:', event);
    // TODO: Apply highlight logic to Plotly chart
  }

  clearHighlight(): void {
    console.log('Clear highlight received in company panel');
    // TODO: Clear highlight logic from Plotly chart
  }
}
