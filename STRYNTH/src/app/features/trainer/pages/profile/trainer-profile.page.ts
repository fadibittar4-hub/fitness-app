import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { AvatarUploadComponent } from '../../../../shared/components/ui/avatar-upload/avatar-upload.component';
import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';

interface TrainerExtra {
  description: string | null;
  specialties: string | null;
  years_experience: number | null;
}

@Component({
  selector: 'trainer-profile-page',
  standalone: true,
  imports: [NgIf, DatePipe, FormsModule, AvatarUploadComponent],
  templateUrl: './trainer-profile.page.html',
  styleUrls: ['./trainer-profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerProfilePage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly extra = signal<TrainerExtra>({ description: null, specialties: null, years_experience: null });
  readonly isEditing = signal(false);
  readonly editDescription = signal('');
  readonly editSpecialties = signal('');
  readonly editYearsExperience = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly saveError = signal('');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.api.get<TrainerExtra>(API_ENDPOINTS.TRAINERS.GET(user.id)).subscribe({
      next: (res) => {
        this.extra.set({
          description: res.data.description,
          specialties: res.data.specialties,
          years_experience: res.data.years_experience,
        });
      },
    });
  }

  startEdit(): void {
    const e = this.extra();
    this.editDescription.set(e.description ?? '');
    this.editSpecialties.set(e.specialties ?? '');
    this.editYearsExperience.set(e.years_experience);
    this.saveError.set('');
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.saveError.set('');
  }

  saveProfile(form: NgForm): void {
    if (form.invalid) return;
    this.isSaving.set(true);
    this.saveError.set('');

    this.api.put<TrainerExtra>(API_ENDPOINTS.TRAINERS.UPDATE_PROFILE, {
      description: this.editDescription() || null,
      specialties: this.editSpecialties() || null,
      years_experience: this.editYearsExperience() ?? null,
    }).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.extra.set({
          description: res.data.description,
          specialties: res.data.specialties,
          years_experience: res.data.years_experience,
        });
        this.isEditing.set(false);
      },
      error: (err: Error) => {
        this.isSaving.set(false);
        this.saveError.set(err.message);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
