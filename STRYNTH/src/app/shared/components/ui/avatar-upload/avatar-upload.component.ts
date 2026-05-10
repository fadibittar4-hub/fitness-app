import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { MediaUrlPipe } from '../../../pipes/media-url.pipe';

@Component({
  selector: 'ui-avatar-upload',
  standalone: true,
  imports: [NgIf, MediaUrlPipe],
  templateUrl: './avatar-upload.component.html',
  styleUrls: ['./avatar-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarUploadComponent {
  readonly imageUrl = input<string | undefined>(undefined);
  readonly initials = input.required<string>();

  private readonly authService = inject(AuthService);

  readonly isUploading = signal(false);
  readonly uploadError = signal<string | null>(null);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadError.set(null);
    this.isUploading.set(true);
    this.authService.uploadProfileImage(file).subscribe({
      next: () => this.isUploading.set(false),
      error: (err: Error) => {
        this.isUploading.set(false);
        this.uploadError.set(err.message);
      },
    });
  }
}
