export interface User {
  id: number;
  nickname: string;
  email: string;
  role: 'user' | 'admin';
  avatar_level: number;
  total_points: number;
  daily_calorie_limit: number;
  current_music_walk_streak: number;
  longest_music_walk_streak: number;
  date_of_birth: string | null;
  birth_date: string | null;
  height: number | null;
  weight: number | null;
  weight_updated_at: string | null;
  waist_circumference: number | null;
  body_fat_percentage: number | null;
  age: number | null;
  bmi: number | null;
  needs_weight_update: boolean;
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
  nickname: string;
  email: string;
  password: string;
  password_confirmation: string;
  date_of_birth: string;
}

export interface UpdateHealthData {
  birth_date?: string | null;
  height?: number | null;
  weight?: number | null;
  waist_circumference?: number | null;
  body_fat_percentage?: number | null;
}
