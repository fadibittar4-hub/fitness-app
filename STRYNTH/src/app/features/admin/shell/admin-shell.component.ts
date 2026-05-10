import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface AdminNavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'admin-shell',
  standalone: true,
  imports: [NgFor, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  readonly navItems: AdminNavItem[] = [
    { label: 'Home', route: '/admin/home' },
    { label: 'Bookings', route: '/admin/bookings' },
    { label: 'Sessions', route: '/admin/sessions' },
    { label: 'Users', route: '/admin/users' },
    { label: 'Profile', route: '/admin/profile' },
  ];
}
