// File: renderer-registry.service.ts

import { Injectable, Type } from '@angular/core';
import { DockviewTabRendererComponent } from '../renderers/dockview-tab-renderer.component';

/* ------------------------------------------------------------
 * (optional—if you support dynamic tab/panel/header renderers)
 * ------------------------------------------------------------ */

@Injectable({ providedIn: 'root' })
export class RendererRegistryService {
  private tabRenderers = new Map<string, Type<any>>();
  private panelRenderers = new Map<string, Type<any>>();

  constructor() {
    this.registerTabRenderer('default', DockviewTabRendererComponent);
  }

  registerTabRenderer(key: string, component: Type<any>): void {
    this.tabRenderers.set(key, component);
  }

  registerPanelRenderer(key: string, component: Type<any>): void {
    this.panelRenderers.set(key, component);
  }

  getTabRenderer(key: string): Type<any> | undefined {
    return this.tabRenderers.get(key);
  }

  getPanelRenderer(key: string): Type<any> | undefined {
    return this.panelRenderers.get(key);
  }

  unregisterTabRenderer(key: string): void {
    this.tabRenderers.delete(key);
  }

  unregisterPanelRenderer(key: string): void {
    this.panelRenderers.delete(key);
  }
}
