// BasePlotComponent (no EventBus)
import {
  OnInit,
  ElementRef,
  Directive,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Directive()
export abstract class BasePlotComponent implements OnInit {
  @Input() plotData: any[] = [];
  @Input() plotLayout: any = {};
  abstract plotSelector: string;

  @Output() hovered = new EventEmitter<string>();
  @Output() clicked = new EventEmitter<string>();
  @Output() selected = new EventEmitter<string[]>();
  @Output() zoomed = new EventEmitter<[string, string]>();
  @Output() cleared = new EventEmitter<void>();

  constructor(protected elRef: ElementRef) {}

  ngOnInit(): void {
    this.initializePlot();
    this.setupEventListeners();
  }

  protected initializePlot(): void {
    Plotly.newPlot(
      this.elRef.nativeElement.querySelector(this.plotSelector),
      this.plotData,
      this.plotLayout,
      { displayModeBar: true, modeBarButtonsToRemove: [], responsive: true }
    );
  }

  protected setupEventListeners(): void {
    const plotElement = this.elRef.nativeElement.querySelector(
      this.plotSelector
    );

    plotElement.on('plotly_hover', (eventData: any) => {
      this.hovered.emit(eventData.points[0].x);
    });

    plotElement.on('plotly_unhover', () => {
      this.hovered.emit('');
    });

    plotElement.on('plotly_click', (eventData: any) => {
      this.clicked.emit(eventData.points[0].x);
    });

    plotElement.on('plotly_selected', (eventData: any) => {
      const items = eventData ? eventData.points.map((p: any) => p.x) : [];
      this.selected.emit(items);
    });

    plotElement.on('plotly_relayout', (eventData: any) => {
      if ('xaxis.range[0]' in eventData && 'xaxis.range[1]' in eventData) {
        this.zoomed.emit([
          eventData['xaxis.range[0]'],
          eventData['xaxis.range[1]'],
        ]);
      }
    });

    plotElement.addEventListener('click', (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.point, .bars')) {
        this.cleared.emit();
      }
    });
  }

  protected abstract highlightItems(item: string): void;
  protected abstract clearHighlight(): void;
}
