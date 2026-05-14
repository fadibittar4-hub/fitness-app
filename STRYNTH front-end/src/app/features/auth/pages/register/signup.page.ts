import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../models/auth.models';

type DisplayRole = 'client' | 'trainer';

@Component({
  selector: 'auth-signup-page',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, RouterLink, ButtonComponent],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly role = signal<DisplayRole>('client');
  readonly submitted = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  setRole(role: DisplayRole): void {
    this.role.set(role);
  }

  onSubmit(form: NgForm): void {
    this.submitted.set(true);
    if (form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const apiRole: UserRole = this.role() === 'client' ? 'trainee' : 'trainer';

    this.authService
      .signup({
        first_name: this.firstName(),
        last_name: this.lastName(),
        email: this.email(),
        password: this.password(),
        role: apiRole,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          void this.router.navigate(['/login']);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }
}