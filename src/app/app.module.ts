// File: ngraph/src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DateSalesPanelComponent } from './panels/date-sales-panel/date-sales-panel.component';
import { CompanySalesPanelComponent } from './panels/company-sales-panel/company-sales-panel.component';
import { ProductSalesPanelComponent } from './panels/product-sales-panel/product-sales-panel.component';
import { PlotlyChartComponent } from './shared/plotly-chart/plotly-chart.component';
import { HistogramComponent } from './components/histogram.component';
import { DockviewContainerComponent } from './components/dockview-container/dockview-container.component';

@NgModule({
  declarations: [
    AppComponent,
    DockviewContainerComponent,
    DateSalesPanelComponent,
    CompanySalesPanelComponent,
    ProductSalesPanelComponent,
    PlotlyChartComponent,
    HistogramComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
