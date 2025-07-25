import { Component } from '@angular/core';
import { BasePlotComponent } from '../shared/plots/base-plot.component';

@Component({
  selector: 'app-histogram',
  template: `<div class="histogram-chart"></div>`,
})
export class HistogramComponent extends BasePlotComponent {
  plotSelector = '.histogram-chart';

  protected highlightItems(item: string): void {
    // Highlight logic specific to histogram
  }

  protected clearHighlight(): void {
    // Clear highlight logic specific to histogram
  }
}
