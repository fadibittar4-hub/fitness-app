import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { AvatarUploadComponent } from '../../../../shared/components/ui/avatar-upload/avatar-upload.component';

@Component({
  selector: 'admin-profile-page',
  standalone: true,
  imports: [NgIf, AvatarUploadComponent],
  templateUrl: './admin-profile.page.html',
  styleUrls: ['./admin-profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProfilePage {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
