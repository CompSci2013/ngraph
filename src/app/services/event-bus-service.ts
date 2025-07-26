/* ------------------------------------------
 * Simple event hub for cross-service/component communication.
 * ------------------------------------------ */
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// --- PATCH START: added 'selected' to DockviewEventType ---
export type DockviewEventType =
  | 'panelClosed'
  | 'panelFocused'
  | 'panelAdded'
  | 'headerActionClicked'
  | 'floatingStateChanged'
  | 'message'
  | 'log'
  | 'highlight'
  | 'clearHighlight'
  | 'selected';
// --- PATCH END ---

export interface DockviewEvent {
  type: DockviewEventType;
  panelId?: string;
  actionId?: string;
  floating?: boolean;
  message?: string;
  timestamp?: string;
  source?: string;
}

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

  onHighlight(panelId: string): Observable<string[]> {
    return this.event$.pipe(
      filter(
        (
          event
        ): event is { type: 'highlight'; panelId: string; message: string } =>
          event.type === 'highlight' && event.panelId === panelId
      ),
      map((event) => JSON.parse(event.message || '[]'))
    );
  }

  onClearHighlight(panelId: string): Observable<void> {
    return this.event$.pipe(
      filter(
        (event): event is { type: 'clearHighlight'; panelId: string } =>
          event.type === 'clearHighlight' && event.panelId === panelId
      ),
      map(() => {})
    );
  }
}
