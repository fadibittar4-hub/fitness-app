import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface TraineeNavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'trainee-shell',
  standalone: true,
  imports: [NgFor, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './trainee-shell.component.html',
  styleUrls: ['./trainee-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraineeShellComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly navItems: TraineeNavItem[] = [
    { label: 'Home', route: '/trainee/home' },
    { label: 'Profile', route: '/trainee/profile' },
  ];

  goToProfile(): void {
    void this.router.navigate(['/trainee/profile']);
  }
}
