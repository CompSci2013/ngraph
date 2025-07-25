// File: panel-registry.service.ts
/* --------------------
 * Maps panel keys/types to Angular components.
 * ---------------------------------------------*/

import { Injectable, Type } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PanelRegistryService {
  private registry = new Map<string, Type<any>>();

  register(key: string, component: Type<any>): void {
    this.registry.set(key, component);
  }

  getComponent(key: string): Type<any> | undefined {
    return this.registry.get(key);
  }

  unregister(key: string): void {
    this.registry.delete(key);
  }

  // Optionally: Expose all registered components
  getAll(): Map<string, Type<any>> {
    return new Map(this.registry);
  }
}
