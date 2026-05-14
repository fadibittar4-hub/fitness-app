import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Booking } from '../../../../features/booking/models/booking.models';

@Component({
  selector: 'ui-session-bookers',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './session-bookers.component.html',
  styleUrls: ['./session-bookers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionBookersComponent {
  @Input() bookers: Booking[] = [];
  @Input() expanded = false;
  @Output() toggle = new EventEmitter<void>();
}
