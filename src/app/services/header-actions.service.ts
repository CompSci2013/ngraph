import { Injectable } from '@angular/core';
import { IDockviewPanel, DockviewApi } from 'dockview-core';
import { EventBusService } from './event-bus-service';

export interface HeaderAction {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
  command: (panelApi: IDockviewPanel, dockviewApi?: DockviewApi) => void;
}

@Injectable({ providedIn: 'root' })
export class HeaderActionsService {
  private actionsRegistry = new Map<string, HeaderAction[]>();
  constructor(private eventBus: EventBusService) {}

  private defaultActions: HeaderAction[] = [
    {
      id: 'popout',
      label: 'Popout',
      icon: 'codicon codicon-browser',
      tooltip: 'Open in Floating Window',
      command: (panelApi, dockviewApi) => {
        if (!dockviewApi) return;
        const panelId = panelApi.id;

        // Emit event via EventBusService
        this.eventBus.emit({
          type: 'log',
          message: `Panel "${panelId}" popped out.`,
          source: panelId,
          timestamp: new Date().toLocaleTimeString(),
        });

        const newGroup = dockviewApi.addGroup({
          referencePanel: panelApi.id,
          direction: 'right',
        });
        (panelApi as any).moveTo?.({ group: newGroup });
        dockviewApi.addPopoutGroup(newGroup, {
          position: { width: 800, height: 600, left: 100, top: 100 },
          popoutUrl: '/popout.html',
        });
      },
    },
    {
      id: 'close',
      label: 'Close',
      icon: 'codicon codicon-close',
      tooltip: 'Close Panel',
      command: (panelApi, dockviewApi) => {
        if (!dockviewApi) {
          return;
        }
        dockviewApi.removePanel(panelApi);
      },
    },
  ];

  registerActions(panelType: string, actions: HeaderAction[]): void {
    this.actionsRegistry.set(panelType, actions);
  }

  getActions(panelType: string): HeaderAction[] {
    return this.actionsRegistry.get(panelType) ?? this.defaultActions;
  }

  clearActions(panelType: string): void {
    this.actionsRegistry.delete(panelType);
  }
}
