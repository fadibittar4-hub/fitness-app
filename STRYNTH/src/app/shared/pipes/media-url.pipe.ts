import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'mediaUrl', standalone: true, pure: true })
export class MediaUrlPipe implements PipeTransform {
  transform(path: string | null | undefined): string | null {
    if (!path) return null;
    return `${environment.mediaUrl}${path}`;
  }
}
