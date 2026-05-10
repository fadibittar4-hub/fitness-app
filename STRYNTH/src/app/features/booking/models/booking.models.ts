import { Session } from '../../sessions/models/session.models';

export type { Session };

export interface Booking {
  id: number;
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  session_id: number;
  status: 'confirmed';
  created_at: string;
  session: Session;
}

export interface BookAndPayRequest {
  session_id: number;
  amount: number;
  payment_method: string;
}

export interface BookAndPayResponse {
  id: number;
  booking_id: number;
  amount: number;
  status: 'paid' | 'failed';
  payment_method: string;
}
