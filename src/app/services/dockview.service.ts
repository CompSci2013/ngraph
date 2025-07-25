/** This service centralizes all interaction with Dockview’s core API.
 *  It makes future testing, state syncing, and extensions (e.g. event dispatching) much easier.
 * */

import {
  Injectable,
  ApplicationRef,
  EmbeddedViewRef,
  ComponentRef,
} from '@angular/core';
import { ComponentFactoryResolver } from '@angular/core';

import { DockviewComponent } from 'dockview-core';
import { IContentRenderer } from 'dockview-core/dist/cjs/dockview/types';
import { PanelStateService, PanelState } from './panel-state.service';
import { HeaderActionsService, HeaderAction } from './header-actions.service';
import { RendererRegistryService } from './render-registry.service';
import { IDockviewPanel } from 'dockview-core';
import { Injector } from '@angular/core';
import {
  CreateComponentOptions,
  ITabRenderer,
  TabPartInitParameters,
  DockviewPanelApi,
  DockviewApi,
  GroupPanelPartInitParameters,
} from 'dockview-core';
import { EventBusService } from './event-bus-service';
import { group } from 'console';

@Injectable({ providedIn: 'root' })
export class DockviewService {
  private dockviewComponent!: DockviewComponent;
  private dockviewApi!: DockviewApi;

  constructor(
    private panelStateService: PanelStateService,
    private headerActionsService: HeaderActionsService,
    private rendererRegistry: RendererRegistryService,
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private eventBus: EventBusService
  ) {}

  initialize(container: HTMLElement, theme: string): DockviewApi {
    if (theme) {
      container.classList.add(theme);
    }

    this.dockviewComponent = new DockviewComponent(container, {
      disableAutoResizing: false,
      floatingGroupBounds: 'boundedWithinViewport',

      createComponent: (options: CreateComponentOptions) => {
        console.log(
          '[DockviewService] createComponent called for:',
          options.name
        );

        const componentType = this.rendererRegistry.getPanelRenderer(
          options.name
        );
        let compnentRef: ComponentRef<any> | null = null;
        if (!componentType) {
          console.error(`No renderer found for ${options.name}`);
          return {
            element: document.createElement('div'),
            init: () => {},
            dispose: () => {},
          };
        }

        const componentFactory =
          this.componentFactoryResolver.resolveComponentFactory(componentType);

        const componentRef = componentFactory.create(this.injector);
        this.injector.get(ApplicationRef).attachView(componentRef.hostView);

        const panelElement = (componentRef.hostView as EmbeddedViewRef<any>)
          .rootNodes[0];

        return {
          element: panelElement,

          init: (params: GroupPanelPartInitParameters) => {
            const panelId = params.api.id;
            console.log(
              `[DockviewService] init called for panelId: ${panelId}`
            );

            const headerActions = [
              {
                id: 'popout',
                label: 'Popout',
                icon: 'codicon codicon-browser',
                tooltip: 'Open in Floating Window',
                command: (panelApi: IDockviewPanel) => {
                  console.log(
                    `[DockviewService] Popout clicked for panelId: ${panelId}`
                  );
                  const dockviewApi = this.dockviewApi;
                  const newGroup = dockviewApi.addGroup({
                    referencePanel: panelApi.id,
                    direction: 'right',
                  });
                  (panelApi as any).moveTo({ group: newGroup });
                  dockviewApi.addPopoutGroup(newGroup, {
                    position: { width: 800, height: 600, left: 100, top: 100 },
                    popoutUrl: '/assets/popout.html',
                  });
                },
              },
              {
                id: 'close',
                label: 'Close',
                icon: 'codicon codicon-close',
                tooltip: 'Close Panel',
                command: (panelApi: IDockviewPanel) => {
                  const panel = this.dockviewApi.getPanel(panelApi.id);
                  if (panel) {
                    this.dockviewApi.removePanel(panel);
                  }
                },
              },
            ];

            params.api.updateParameters({ headerActions });
            this.panelStateService.setPanelActions(panelId, headerActions);

            if (params.params) {
              Object.assign(componentRef.instance, params.params);
            }
          },

          dispose: () => {
            componentRef.destroy();
          },
        };
      },

      createTabComponent: (options: CreateComponentOptions): ITabRenderer => {
        const element = document.createElement('div');
        element.classList.add('custom-tab');

        let actionsContainer: HTMLElement;
        let titleSpan: HTMLElement;

        return {
          element,

          init: (parameters: TabPartInitParameters): void => {
            titleSpan = document.createElement('span');
            titleSpan.textContent = parameters.title || options.id;
            titleSpan.classList.add('custom-tab-title');
            element.appendChild(titleSpan);

            actionsContainer = document.createElement('div');
            actionsContainer.classList.add('custom-tab-actions');
            element.appendChild(actionsContainer);

            const renderActions = (actions: Array<any>) => {
              actionsContainer.innerHTML = '';
              actions.forEach((action) => {
                const button = document.createElement('button');
                button.className = `dockview-tab-action ${action.icon}`;
                button.title = action.tooltip;
                button.onclick = (e) => {
                  e.stopPropagation();
                  action.command(parameters.api);
                };
                actionsContainer.appendChild(button);
              });
            };

            parameters.api.onDidParametersChange((event) => {
              const actions = event['params']?.['headerActions'] || [];
              renderActions(actions);
            });

            const initialActions = parameters.params?.['headerActions'] || [];
            renderActions(initialActions);
          },

          dispose: () => {
            element.remove();
          },
        };
      },
    });

    this.dockviewApi = this.dockviewComponent.api;
    return this.dockviewApi;
  }

  dispose(): void {
    this.dockviewComponent?.dispose();
  }

  addPanel(config: any): void {
    const headerActions = this.headerActionsService.getActions(
      config.component
    );

    const dockviewApiRef = this.dockviewApi;
    const actionsWithDockviewApi = headerActions.map((action) => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      tooltip: action.tooltip,
      command: (panelApi: IDockviewPanel) => {
        action.command(panelApi, dockviewApiRef);
      },
    }));

    const panel = this.dockviewApi.addPanel({
      id: config.id,
      title: config.title,
      component: config.component,
      position: config.position,
      tabComponent: 'default',
      params: {
        ...(config.inputs || {}),
        headerActions: actionsWithDockviewApi,
      },
    });

    const state: PanelState = {
      id: config.id,
      title: config.title,
      active: true,
      floating: false,
      headerActions: actionsWithDockviewApi,
    };

    this.panelStateService.addPanel(state);
  }

  focusPanel(id: string): void {
    this.dockviewApi?.getPanel(id)?.focus();
    this.panelStateService.activatePanel(id);
  }
}
