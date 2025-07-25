import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { HeaderAction } from '../services/header-actions.service';

@Component({
  selector: 'adv-tab-renderer',
  template: `
    <div class="dv-tab-title">
      <span class="dv-tab-title-text">{{ title }}</span>
      <button
        *ngFor="let action of headerActions"
        class="dv-tab-action"
        (click)="onActionClick(action)"
      >
        <i [class]="action.icon" [title]="action.tooltip"></i>
      </button>
    </div>
  `,
  styles: [
    `
      .dv-tab-title {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dv-tab-title-text {
        font-weight: bold;
      }
      .dv-tab-action {
        background: transparent;
        border: none;
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockviewTabRendererComponent {
  @Input() title!: string;
  @Input() headerActions: HeaderAction[] = [];

  @Output() actionClicked = new EventEmitter<HeaderAction>();

  onActionClick(action: HeaderAction): void {
    this.actionClicked.emit(action);
  }
}
