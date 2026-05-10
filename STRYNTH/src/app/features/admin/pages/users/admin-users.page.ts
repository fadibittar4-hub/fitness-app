import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminService, AdminUser, UpdateTrainerProfileRequest } from '../../services/admin.service';

@Component({
  selector: 'admin-users-page',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPage implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly users = signal<AdminUser[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  readonly editingId = signal<number | null>(null);
  readonly editFirstName = signal('');
  readonly editLastName = signal('');
  readonly editEmail = signal('');
  readonly editRole = signal<'member' | 'trainer' | 'admin'>('member');
  readonly editDescription = signal('');
  readonly editSpecialties = signal('');
  readonly editYearsExperience = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly saveError = signal('');

  ngOnInit(): void {
    this.isLoading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.users.set(res.data);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.error.set(err.message);
      },
    });
  }

  startEdit(user: AdminUser): void {
    this.editingId.set(user.id);
    this.editFirstName.set(user.first_name);
    this.editLastName.set(user.last_name);
    this.editEmail.set(user.email);
    this.editRole.set(user.role === 'trainee' ? 'member' : user.role as 'member' | 'trainer' | 'admin');
    this.editDescription.set('');
    this.editSpecialties.set('');
    this.editYearsExperience.set(null);
    this.saveError.set('');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.saveError.set('');
  }

  saveEdit(form: NgForm): void {
    if (form.invalid) return;
    const id = this.editingId();
    if (id === null) return;

    this.isSaving.set(true);
    this.saveError.set('');

    this.adminService.updateUser(id, {
      first_name: this.editFirstName(),
      last_name: this.editLastName(),
      email: this.editEmail(),
      role: this.editRole(),
    }).subscribe({
      next: (res) => {
        const updatedUser = res.data;
        const isTrainer = updatedUser.role === 'trainer';
        const hasProfileData = isTrainer && (
          this.editDescription() || this.editSpecialties() || this.editYearsExperience() != null
        );

        if (hasProfileData) {
          const profileReq: UpdateTrainerProfileRequest = {};
          if (this.editDescription()) profileReq.description = this.editDescription();
          if (this.editSpecialties()) profileReq.specialties = this.editSpecialties();
          if (this.editYearsExperience() != null) profileReq.years_experience = this.editYearsExperience()!;

          this.adminService.updateTrainerProfile(id, profileReq).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.users.update((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
              this.editingId.set(null);
            },
            error: (err: Error) => {
              this.isSaving.set(false);
              this.saveError.set(err.message);
            },
          });
        } else {
          this.isSaving.set(false);
          this.users.update((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
          this.editingId.set(null);
        }
      },
      error: (err: Error) => {
        this.isSaving.set(false);
        this.saveError.set(err.message);
      },
    });
  }
}
