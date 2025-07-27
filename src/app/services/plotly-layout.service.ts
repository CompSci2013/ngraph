// PATCH START: PlotlyLayoutService to centralize resize handling for Plotly charts

import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PlotlyLayoutEvent {
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class PlotlyLayoutService {
  private resizeObserver!: ResizeObserver;

  private elements = new Map<HTMLElement, BehaviorSubject<PlotlyLayoutEvent>>();

  constructor() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const subject = this.elements.get(entry.target as HTMLElement);
        if (subject) {
          const width = entry.contentRect.width;
          const height = entry.contentRect.height;
          if (width > 0 && height > 0) {
            subject.next({ width, height });
          }
        }
      }
    });
  }

  register(elementRef: ElementRef): BehaviorSubject<PlotlyLayoutEvent> {
    const element = elementRef.nativeElement as HTMLElement;

    if (!this.elements.has(element)) {
      const layoutSubject = new BehaviorSubject<PlotlyLayoutEvent>({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
      this.elements.set(element, layoutSubject);
      this.resizeObserver.observe(element);

      return layoutSubject;
    }

    return this.elements.get(element)!;
  }

  unregister(elementRef: ElementRef): void {
    const element = elementRef.nativeElement as HTMLElement;

    if (this.elements.has(element)) {
      this.resizeObserver.unobserve(element);
      this.elements.get(element)!.complete();
      this.elements.delete(element);
    }
  }
}

// PATCH END
