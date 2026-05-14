import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgClass, NgIf } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { PaymentService } from '../../services/payment.service';

interface TrainerSummary {
  name: string;
  specialty: string;
  imageUrl: string;
}

interface SessionSummary {
  sessionName: string;
  date: string;
  time: string;
  price: number;
}

const cardNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const digits = String(control.value ?? '').replace(/\D/g, '');
  return digits.length === 16 ? null : { cardNumber: true };
};

const expiryValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();

  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return { expiry: true };
  }

  const [monthText, yearText] = value.split('/');
  const month = Number(monthText);
  const year = Number(`20${yearText}`);

  if (month < 1 || month > 12) {
    return { expiry: true };
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { expired: true };
  }

  return null;
};

@Component({
  selector: 'checkout-payment-page',
  standalone: true,
  imports: [NgIf, NgClass, CurrencyPipe, ReactiveFormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly sessionId = computed<number>(() =>
    Number(this.queryParamMap().get('sessionId') ?? 0),
  );

  readonly trainerId = computed<number | null>(() => {
    const id = this.queryParamMap().get('trainerId');
    return id ? Number(id) : null;
  });

  readonly trainer = computed<TrainerSummary>(() => ({
    name: this.queryParamMap().get('trainerName') ?? 'Your Trainer',
    specialty: 'Training Session',
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
  }));

  readonly booking = computed<SessionSummary>(() => {
    const sessionTimeStr = this.queryParamMap().get('sessionTime') ?? '';
    const d = sessionTimeStr ? new Date(sessionTimeStr) : null;
    return {
      sessionName: 'Training Session',
      date: d
        ? d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A',
      time: d
        ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : 'N/A',
      price: Number(this.queryParamMap().get('amount') ?? 49.99),
    };
  });

  readonly isProcessing = signal(false);
  readonly errorMessage = signal('');

  readonly paymentForm = this.formBuilder.nonNullable.group({
    cardholderName: ['', [Validators.required, Validators.minLength(2)]],
    cardNumber: ['', [Validators.required, cardNumberValidator]],
    expiryDate: ['', [Validators.required, expiryValidator]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  readonly total = computed(() => this.booking().price);

  get cardholderName(): AbstractControl<string, string> {
    return this.paymentForm.controls.cardholderName;
  }

  get cardNumber(): AbstractControl<string, string> {
    return this.paymentForm.controls.cardNumber;
  }

  get expiryDate(): AbstractControl<string, string> {
    return this.paymentForm.controls.expiryDate;
  }

  get cvv(): AbstractControl<string, string> {
    return this.paymentForm.controls.cvv;
  }

  formatCardNumber(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    this.cardNumber.setValue(formatted, { emitEvent: false });
    this.resetMessages();
  }

  formatExpiryDate(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    this.expiryDate.setValue(formatted, { emitEvent: false });
    this.resetMessages();
  }

  formatCvv(value: string): void {
    this.cvv.setValue(value.replace(/\D/g, '').slice(0, 4), { emitEvent: false });
    this.resetMessages();
  }

  onCardholderInput(value: string): void {
    this.cardholderName.setValue(value, { emitEvent: false });
    this.resetMessages();
  }

  payNow(): void {
    this.resetMessages();

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.errorMessage.set('Enter valid payment details before submitting.');
      return;
    }

    this.isProcessing.set(true);

    this.paymentService
      .bookAndPay({
        session_id: this.sessionId(),
        amount: this.total(),
        payment_method: 'card',
      })
      .subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          if (res.data.status === 'paid') {
            void this.router.navigate(['/trainee/bookings'], {
              state: { bookingConfirmed: true },
            });
          } else {
            this.errorMessage.set('Payment could not be completed. Try a different card.');
          }
        },
        error: (err: Error) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }

  fieldError(fieldName: 'cardholderName' | 'cardNumber' | 'expiryDate' | 'cvv'): string {
    const control = this.paymentForm.controls[fieldName];

    if (!control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['minlength']) {
      return 'Enter the full name on the card.';
    }

    if (control.errors['cardNumber']) {
      return 'Enter a valid 16-digit card number.';
    }

    if (control.errors['expiry']) {
      return 'Use MM/YY format.';
    }

    if (control.errors['expired']) {
      return 'Card expiry date is in the past.';
    }

    if (control.errors['pattern']) {
      return fieldName === 'cvv' ? 'CVV must be 3 or 4 digits.' : 'Enter a valid value.';
    }

    return 'Check this field and try again.';
  }

  private resetMessages(): void {
    this.errorMessage.set('');
  }

  goBack(): void {
    const id = this.trainerId();
    if (id) {
      void this.router.navigate(['/trainee/trainer', id]);
    } else {
      void this.router.navigate(['/trainee/home']);
    }
  }
}
