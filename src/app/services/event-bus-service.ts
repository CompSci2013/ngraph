// File: event-bus.service.ts

/* ------------------------------------------
 * Simple event hub for cross-service/component comms (could be improved with event type union/interface).
 * ------------------------------------------ */
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface LogEvent {
  type: 'log';
  message: string;
  timestamp?: string;
  source?: string; // Panel ID or other source
}

// Define event types
export type DockviewEvent =
  | { type: 'panelClosed'; panelId: string }
  | { type: 'panelFocused'; panelId: string }
  | { type: 'panelAdded'; panelId: string }
  | { type: 'headerActionClicked'; panelId: string; actionId: string }
  | { type: 'floatingStateChanged'; panelId: string; floating: boolean }
  | { type: 'message'; toPanelId: string; message: string }
  | { type: 'log'; message: string; timestamp?: string; source?: string };

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private event$ = new Subject<DockviewEvent>();

  emit(event: DockviewEvent): void {
    this.event$.next(event);
  }

  on(): Observable<DockviewEvent> {
    return this.event$.asObservable();
  }

  // Filtered event subscriptions
  onPanelAdded(): Observable<string> {
    return this.event$.pipe(
      filter(
        (event): event is { type: 'panelAdded'; panelId: string } =>
          event.type === 'panelAdded'
      ),
      map((event) => event.panelId)
    );
  }

  onPanelFocused(): Observable<string> {
    return this.event$.pipe(
      filter(
        (event): event is { type: 'panelFocused'; panelId: string } =>
          event.type === 'panelFocused'
      ),
      map((event) => event.panelId)
    );
  }

  onPanelClosed(): Observable<string> {
    return this.event$.pipe(
      filter(
        (event): event is { type: 'panelClosed'; panelId: string } =>
          event.type === 'panelClosed'
      ),
      map((event) => event.panelId)
    );
  }

  onHeaderActionClicked(): Observable<{ panelId: string; actionId: string }> {
    return this.event$.pipe(
      filter(
        (
          event
        ): event is {
          type: 'headerActionClicked';
          panelId: string;
          actionId: string;
        } => event.type === 'headerActionClicked'
      ),
      map((event) => ({ panelId: event.panelId, actionId: event.actionId }))
    );
  }

  onFloatingStateChanged(): Observable<{ panelId: string; floating: boolean }> {
    return this.event$.pipe(
      filter(
        (
          event
        ): event is {
          type: 'floatingStateChanged';
          panelId: string;
          floating: boolean;
        } => event.type === 'floatingStateChanged'
      ),
      map((event) => ({ panelId: event.panelId, floating: event.floating }))
    );
  }
}
