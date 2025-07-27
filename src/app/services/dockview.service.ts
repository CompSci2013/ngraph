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

import {
  DockviewComponent,
  DockviewTheme,
  themeDracula,
  themeVisualStudio,
  themeAbyss,
  themeAbyssSpaced,
  themeDark,
  themeLight,
  themeLightSpaced,
  themeReplit,
} from 'dockview-core';
import { PanelStateService, PanelState } from './panel-state.service';
import { HeaderActionsService } from './header-actions.service';
import { RendererRegistryService } from './render-registry.service';
import { Injector } from '@angular/core';
import {
  CreateComponentOptions,
  ITabRenderer,
  TabPartInitParameters,
  DockviewApi,
  GroupPanelPartInitParameters,
  IDockviewPanel,
} from 'dockview-core';
import { EventBusService } from './event-bus-service';

@Injectable({ providedIn: 'root' })
export class DockviewService {
  private dockviewApi!: DockviewApi;
  private dockviewComponents: Map<string, DockviewComponent> = new Map();
  private dockviewApis: Map<string, DockviewApi> = new Map();

  constructor(
    private panelStateService: PanelStateService,
    private headerActionsService: HeaderActionsService,
    private rendererRegistry: RendererRegistryService,
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private eventBus: EventBusService
  ) {}

  initialize(
    container: HTMLElement,
    theme: DockviewTheme,
    containerId: string
  ): DockviewApi {
    const dockviewComponent = new DockviewComponent(container, {
      disableAutoResizing: false,
      floatingGroupBounds: 'boundedWithinViewport',
      theme: theme,

      createComponent: (options: CreateComponentOptions) => {
        const componentType = this.rendererRegistry.getPanelRenderer(
          options.name
        );
        if (!componentType) {
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
            const headerActions = this.headerActionsService.getActions(
              options.name
            );
            params.api.updateParameters({ headerActions });
            this.panelStateService.setPanelActions(panelId, headerActions);
            if (params.params) {
              Object.assign(componentRef.instance, params.params);
            }
          },
          dispose: () => componentRef.destroy(),
        };
      },

      createTabComponent: (options: CreateComponentOptions): ITabRenderer => {
        const element = document.createElement('div');
        element.classList.add('custom-tab');

        element.style.display = 'inline-flex';
        element.style.alignItems = 'center';
        element.style.fontSize = 'initial';
        element.style.marginTop = '5px';

        let actionsContainer: HTMLElement;
        let titleSpan: HTMLElement;

        return {
          element,

          init: (parameters: TabPartInitParameters): void => {
            titleSpan = document.createElement('span');
            titleSpan.textContent = parameters.title || options.id;
            titleSpan.classList.add('custom-tab-title');

            titleSpan.style.display = 'flex';
            titleSpan.style.marginRight = '10px';
            titleSpan.style.alignItems = 'end';

            element.appendChild(titleSpan);

            actionsContainer = document.createElement('div');
            actionsContainer.classList.add('custom-tab-actions');
            actionsContainer.style.display = 'flex';
            actionsContainer.style.alignItems = 'center';

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

    const api = dockviewComponent.api;
    api.onUnhandledDragOverEvent((event: any) => {
      console.log('[Dockview] Drag over event:', event);
      event.nativeEvent.preventDefault();
    });

    api.onDidDrop((event: any) => {
      console.log('[Dockview] Drop event:', event);
      const sourceApi = (event as any).api as DockviewApi;
      const dropped = (event as any).panel as {
        id: string;
        title: string;
        component: string;
        params: any;
      };
      if (sourceApi && dropped) {
        console.log('[Dockview] Drop event source panel:', dropped);
        const panel = sourceApi.getPanel(dropped.id);
        if (panel) {
          sourceApi.removePanel(panel);
        }
        this.addPanel(
          {
            id: dropped.id,
            title: dropped.title,
            component: dropped.component,
            position: { referencePanel: undefined, direction: 'within' },
            inputs: dropped.params,
          },
          containerId
        );
      }
    });

    this.dockviewComponents.set(containerId, dockviewComponent);
    this.dockviewApis.set(containerId, api);
    this.dockviewApi = api;

    return api;
  }

  dispose(containerId: string): void {
    this.dockviewComponents.get(containerId)?.dispose();
    this.dockviewComponents.delete(containerId);
    this.dockviewApis.delete(containerId);
  }

  addPanel(config: any, containerId: string): void {
    const headerActions = this.headerActionsService.getActions(
      config.component
    );

    const dockviewApiRef = this.dockviewApis.get(containerId);
    const actionsWithDockviewApi = headerActions.map((action) => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      tooltip: action.tooltip,
      command: (panelApi: IDockviewPanel) => {
        action.command(panelApi, dockviewApiRef);
      },
    }));

    dockviewApiRef?.addPanel({
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
  }

  focusPanel(id: string): void {
    this.dockviewApi?.getPanel(id)?.focus();
  }
}
