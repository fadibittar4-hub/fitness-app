import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'ui-trainer-card',
  standalone: true,
  imports: [NgIf, BadgeComponent, RatingStarsComponent, ButtonComponent],
  templateUrl: './trainer-card.component.html',
  styleUrls: ['./trainer-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerCardComponent {
  @Input() imageUrl = '';
  @Input() name = 'Trainer Name';
  @Input() specialty = 'Strength Coach';
  @Input() location = 'Remote';
  @Input() sessionMode: 'Online' | 'In-Person' | 'Hybrid' = 'Online';
  @Input() verified = true;
  @Input() price = '$75';
  @Input() sessionLabel = '/ session';
  @Input() rating = 4.9;
  @Input() reviewCount = 120;
  @Input() badge = 'Top Coach';
  @Input() ctaLabel = 'Book Now';
  @Output() bookNow = new EventEmitter<void>();

  onCardClick(): void {
    this.bookNow.emit();
  }

  onBookNow(event?: Event): void {
    event?.stopPropagation();
    this.bookNow.emit();
  }
}