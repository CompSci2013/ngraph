import type { HeaderAction } from './services/header-actions.service';

export interface DockviewInputValues {
  [key: string]: any;
}

export interface DockviewPanelConfig {
  id: string;
  title?: string;
  component: string;
  inputs?: DockviewInputValues;
  float?: boolean;
  headerActions?: HeaderAction[];
  position?: any; // <-- Added for Dockview compatibility
}

/**
 * Optional base interface for Angular panel components.
 * Not required for registration, but helps ensure compatibility with Dockview API.
 */
export interface DockviewPanel {
  id?: string;
  title?: string;
  [key: string]: unknown;
}

/**
 * Used by our custom tab renderer. Passed into PanelUpdateEvent<T>.
 */
export interface DockviewTabRendererParams {
  title: string;
}

// export type { DockviewApi } from 'dockview-core';

// File: projects/angular-dockview/src/lib/dockview.types.ts

import type { DockviewApi as BaseDockviewApi } from 'dockview-core';

declare module 'dockview-core' {
  interface DockviewApi {
    registerTabRenderer?: (id: string, renderer: any) => void;
  }
}

export type DockviewApi = BaseDockviewApi;
