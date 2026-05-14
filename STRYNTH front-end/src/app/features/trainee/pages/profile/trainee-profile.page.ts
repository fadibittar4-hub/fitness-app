import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AvatarUploadComponent } from '../../../../shared/components/ui/avatar-upload/avatar-upload.component';

@Component({
  selector: 'trainee-profile-page',
  standalone: true,
  imports: [NgIf, RouterLink, AvatarUploadComponent],
  templateUrl: './trainee-profile.page.html',
  styleUrls: ['./trainee-profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraineeProfilePage {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
