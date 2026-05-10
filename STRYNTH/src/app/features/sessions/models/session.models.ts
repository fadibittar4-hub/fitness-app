export interface Session {
  id: number;
  trainer_id: number;
  trainer_first_name: string;
  trainer_last_name: string;
  session_time: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  capacity: number;
  price: number;
  created_at: string;
}

export interface CreateSessionRequest {
  session_time: string;
  capacity: number;
  price?: number;
}

export interface UpdateSessionRequest {
  session_time?: string;
  capacity?: number;
  status?: 'available' | 'booked' | 'completed' | 'cancelled';
  price?: number;
}
