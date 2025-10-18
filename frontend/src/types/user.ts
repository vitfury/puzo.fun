export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar_level: number;
  total_points: number;
  daily_calorie_limit: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
