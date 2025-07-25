// File: panel-state.service.ts
/* --------------------------------------------------------------------
 * Tracks panel open/close/focus/floating state and per-panel metadata.
 * -------------------------------------------------------------------- */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// import { DockviewHeaderAction } from '../dockview.types';
import { HeaderAction } from './header-actions.service';

export interface PanelState {
  id: string;
  title: string;
  active: boolean;
  floating: boolean;
  headerActions?: HeaderAction[];
}

@Injectable({ providedIn: 'root' })
export class PanelStateService {
  private panels = new Map<string, PanelState>();
  private panels$ = new BehaviorSubject<PanelState[]>([]);

  // Observable for all panel states
  get panelStates$(): Observable<PanelState[]> {
    return this.panels$.asObservable();
  }

  /**
   * Add or register a panel's state.
   */
  addPanel(state: PanelState): void {
    this.panels.set(state.id, state);
    this.emit();
  }

  /**
   * Update an existing panel's state.
   */
  updatePanel(id: string, patch: Partial<PanelState>): void {
    const panel = this.panels.get(id);
    if (panel) {
      Object.assign(panel, patch);
      this.emit();
    }
  }

  /**
   * Remove a panel's state.
   */
  removePanel(id: string): void {
    this.panels.delete(id);
    this.emit();
  }

  /**
   * Get the state for a panel.
   */
  getPanel(id: string): PanelState | undefined {
    return this.panels.get(id);
  }

  setPanelActions(panelId: string, actions: HeaderAction[]): void {
    const panel = this.panels.get(panelId);
    if (panel) {
      panel.headerActions = actions;
      this.emit();
    }
  }

  getPanelActions(panelId: string): HeaderAction[] {
    return this.panels.get(panelId)?.headerActions ?? [];
  }

  /**
   * Helper: emits the current state for change detection.
   */
  private emit(): void {
    this.panels$.next(Array.from(this.panels.values()));
  }

  activatePanel(id: string): void {
    this.updatePanel(id, { active: true });
  }

  deactivatePanel(id: string): void {
    this.updatePanel(id, { active: false });
  }

  setFloating(id: string, floating: boolean): void {
    this.updatePanel(id, { floating });
  }
}
