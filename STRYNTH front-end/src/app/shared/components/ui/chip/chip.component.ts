import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

type ChipTone = 'default' | 'active';

@Component({
  selector: 'ui-chip',
  standalone: true,
  imports: [NgClass],
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  @Input() label = '';
  @Input() tone: ChipTone = 'default';
  @Output() chipClick = new EventEmitter<void>();

  onChipClick(): void {
    this.chipClick.emit();
  }
}