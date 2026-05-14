import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface TrainerNavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'trainer-shell',
  standalone: true,
  imports: [NgFor, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './trainer-shell.component.html',
  styleUrls: ['./trainer-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerShellComponent {
  readonly navItems: TrainerNavItem[] = [
    { label: 'Home', route: '/trainer/home' },
    { label: 'Create', route: '/trainer/create' },
    { label: 'Profile', route: '/trainer/profile' },
  ];
}
