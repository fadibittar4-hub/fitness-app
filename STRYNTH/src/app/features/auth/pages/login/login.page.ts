import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'auth-login-page',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, RouterLink, ButtonComponent],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly submitted = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(form: NgForm): void {
    this.submitted.set(true);
    if (form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login({ email: this.email(), password: this.password() })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          const role = res.data.user.role;
          if (role === 'trainer') void this.router.navigate(['/trainer/home']);
          else if (role === 'admin') void this.router.navigate(['/admin/home']);
          else void this.router.navigate(['/trainee/home']);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }
}
