import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { MediaUrlPipe } from '../../../../shared/pipes/media-url.pipe';
import { SessionService } from '../../../sessions/services/session.service';
import { Session } from '../../../sessions/models/session.models';
import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TrainerListItem } from '../home/trainee-home.page';


@Component({
  selector: 'trainee-trainer-detail-page',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, CurrencyPipe, TitleCasePipe, ButtonComponent, MediaUrlPipe],
  templateUrl: './trainer-detail.page.html',
  styleUrls: ['./trainer-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly sessionService = inject(SessionService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly trainerId = computed(() => Number(this.paramMap().get('id') ?? 0));

  readonly trainer = signal<TrainerListItem | null>(null);
  readonly sessions = signal<Session[]>([]);
  readonly selectedSessionId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isBooking = signal(false);
  readonly loadError = signal('');

  readonly selectedSession = computed(
    () => this.sessions().find((s) => s.id === this.selectedSessionId()) ?? null,
  );

  readonly sessionPrice = computed(() => this.selectedSession()?.price ?? 0);

  ngOnInit(): void {
    this.isLoading.set(true);

    this.api.get<TrainerListItem>(API_ENDPOINTS.TRAINERS.GET(this.trainerId())).subscribe({
      next: (res) => {
        this.trainer.set(res.data);
        this.loadSessions();
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.loadError.set(err.message);
      },
    });
  }

  goBack(): void {
    void this.router.navigate(['/trainee/home']);
  }

  selectSession(id: number): void {
    const session = this.sessions().find((s) => s.id === id);
    if (!session || session.status !== 'available') return;
    this.selectedSessionId.set(id);
  }

  bookSession(): void {
    const session = this.selectedSession();
    if (!session) return;

    const t = this.trainer();
    void this.router.navigate(['/payment'], {
      queryParams: {
        sessionId: session.id,
        trainerId: t?.id,
        trainerName: t ? `${t.first_name} ${t.last_name}` : 'Your Trainer',
        sessionTime: session.session_time,
        amount: this.sessionPrice(),
      },
    });
  }

  private loadSessions(): void {
    this.sessionService.getAvailableSessions().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const t = this.trainer();
        this.sessions.set(
          t
            ? res.data.filter(
                (s) =>
                  s.trainer_first_name === t.first_name &&
                  s.trainer_last_name === t.last_name,
              )
            : [],
        );
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.loadError.set(err.message);
      },
    });
  }
}
