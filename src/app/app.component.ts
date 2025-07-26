import { Component, Input, AfterViewInit, ViewChild } from '@angular/core';
import { RendererRegistryService } from './services/render-registry.service';
import { DateSalesPanelComponent } from './panels/date-sales-panel/date-sales-panel.component';
import { ProductSalesPanelComponent } from './panels/product-sales-panel/product-sales-panel.component';
import { CompanySalesPanelComponent } from './panels/company-sales-panel/company-sales-panel.component';
import {
  themeDracula,
  DockviewTheme,
  themeLight,
  themeDark,
  themeVisualStudio,
  themeReplit,
} from 'dockview-core';
import { DockviewContainerComponent } from './components/dockview-container/dockview-container.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./dockview.css'],
})
export class AppComponent implements AfterViewInit {
  @Input() chosenTheme: DockviewTheme = themeDark;
  @ViewChild(DockviewContainerComponent, { static: true })
  dockviewContainer!: DockviewContainerComponent;

  constructor(private rendererRegistry: RendererRegistryService) {}

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

    console.log('[Chosen Theme:]', this.chosenTheme);

    // Initialize Dockview explicitly
    // this.dockviewService.initialize(
    //   this.container.nativeElement,
    //   this.chosenTheme
    // );

    // Add panels after initialization
    this.dockviewContainer.addPanel({
      id: 'date-sales-panel',
      title: 'Sales by Date',
      component: 'dateSalesPanel',
      position: { direction: 'left' },
    });

    this.dockviewContainer.addPanel({
      id: 'company-sales-panel',
      title: 'Sales by Company',
      component: 'companySalesPanel',
      position: { direction: 'left' },
    });

    this.dockviewContainer.addPanel({
      id: 'product-sales-panel',
      title: 'Sales by Product',
      component: 'productSalesPanel',
      position: { direction: 'left' },
    });
  }
}
