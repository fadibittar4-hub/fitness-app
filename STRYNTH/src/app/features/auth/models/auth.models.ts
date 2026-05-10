export type UserRole = 'admin' | 'trainer' | 'trainee';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  profile_image_url?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
}
