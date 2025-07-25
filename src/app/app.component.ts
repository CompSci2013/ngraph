import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DockviewService } from './services/dockview.service';
import { RendererRegistryService } from './services/render-registry.service';

import { DateSalesPanelComponent } from './panels/date-sales-panel/date-sales-panel.component';
import { CompanySalesPanelComponent } from './panels/company-sales-panel/company-sales-panel.component';
import { ProductSalesPanelComponent } from './panels/product-sales-panel/product-sales-panel.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./dockview.css'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('dockviewContainer', { static: true }) container!: ElementRef;

  constructor(
    private dockviewService: DockviewService,
    private rendererRegistry: RendererRegistryService
  ) {}

  ngAfterViewInit(): void {
    // Register demo-specific panel components explicitly here in DEMO ONLY
    this.rendererRegistry.registerPanelRenderer(
      'dateSalesPanel',
      DateSalesPanelComponent
    );
    this.rendererRegistry.registerPanelRenderer(
      'companySalesPanel',
      CompanySalesPanelComponent
    );
    this.rendererRegistry.registerPanelRenderer(
      'productSalesPanel',
      ProductSalesPanelComponent
    );

    // Initialize Dockview explicitly
    this.dockviewService.initialize(
      this.container.nativeElement,
      'dockview-theme-light'
    );

    // Add panels after initialization
    this.dockviewService.addPanel({
      id: 'date-sales-panel',
      title: 'Sales by Date',
      component: 'dateSalesPanel',
      position: { direction: 'left' },
    });

    this.dockviewService.addPanel({
      id: 'company-sales-panel',
      title: 'Sales by Company',
      component: 'companySalesPanel',
      position: { direction: 'right' },
    });

    this.dockviewService.addPanel({
      id: 'product-sales-panel',
      title: 'Sales by Product',
      component: 'productSalesPanel',
      position: { direction: 'below' },
    });
  }
}
