import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe, NgFor } from '@angular/common';

@Component({
  selector: 'ui-rating-stars',
  standalone: true,
  imports: [NgFor, DecimalPipe],
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() max = 5;

  get stars(): boolean[] {
    return Array.from({ length: this.max }, (_, index) => index < Math.round(this.rating));
  }
}