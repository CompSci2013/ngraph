import { Injectable } from '@angular/core';
import { DockviewApi } from 'dockview-core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private dockviewApi: DockviewApi | null = null;

  registerDockviewApi(api: DockviewApi) {
    this.dockviewApi = api;
  }

  saveLayout(): string | null {
    if (!this.dockviewApi) return null;
    const layoutState = this.dockviewApi.toJSON();
    return JSON.stringify(layoutState);
  }

  restoreLayout(serializedLayout: string): void {
    if (!this.dockviewApi) return;
    const layoutState = JSON.parse(serializedLayout);
    this.dockviewApi.fromJSON(layoutState);
  }
}
