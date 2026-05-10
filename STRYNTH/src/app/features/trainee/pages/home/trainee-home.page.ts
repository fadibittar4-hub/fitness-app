import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MediaUrlPipe } from '../../../../shared/pipes/media-url.pipe';
import { SearchBarComponent } from '../../../../shared/components/ui/search-bar/search-bar.component';
import { ChipComponent } from '../../../../shared/components/ui/chip/chip.component';
import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';

export interface TrainerListItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_image_url?: string;
  created_at: string;
  description?: string | null;
  specialties?: string | null;
  years_experience?: number | null;
}

interface FilterChip { label: string; value: string; }

@Component({
  selector: 'trainee-home-page',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, SearchBarComponent, ChipComponent, MediaUrlPipe],
  templateUrl: './trainee-home.page.html',
  styleUrls: ['./trainee-home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraineeHomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  readonly trainers = signal<TrainerListItem[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly searchTerm = signal('');
  readonly activeFilter = signal('all');

  readonly filters: FilterChip[] = [
    { label: 'All', value: 'all' },
    { label: 'Muscle Gain', value: 'muscle' },
    { label: 'Fat Loss', value: 'fat' },
    { label: 'Flexibility', value: 'flexibility' },
    { label: 'Beginner', value: 'beginner' },
  ];

  readonly filteredTrainers = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const f = this.activeFilter();

    return this.trainers().filter((t) => {
      const haystack = `${t.specialties ?? ''} ${t.description ?? ''}`.toLowerCase();

      const matchesFilter =
        f === 'all' ||
        (f === 'muscle' && haystack.includes('muscle')) ||
        (f === 'fat' && (haystack.includes('fat') || haystack.includes('weight loss'))) ||
        (f === 'flexibility' && (haystack.includes('flex') || haystack.includes('mobility') || haystack.includes('stretch'))) ||
        (f === 'beginner' && (haystack.includes('beginner') || haystack.includes('starter') || haystack.includes('foundation')));

      if (!matchesFilter) return false;
      if (!q) return true;
      const full = `${t.first_name} ${t.last_name}`.toLowerCase();
      return full.includes(q) || t.email.toLowerCase().includes(q);
    });
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.api.get<TrainerListItem[]>(API_ENDPOINTS.TRAINERS.LIST).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.trainers.set(res.data);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.loadError.set(err.message);
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  setFilter(value: string): void {
    this.activeFilter.set(value);
  }

  viewTrainer(id: number): void {
    void this.router.navigate(['/trainee/trainer', id]);
  }
}
