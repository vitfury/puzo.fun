export interface Equipment {
  id: number;
  name: string;
  type: 'armor' | 'weapon';
  grade: 'no-grade' | 'D' | 'C' | 'B' | 'A' | 'S';
  required_level: number;
  price: number;
  is_active: boolean;
  can_equip?: boolean;
  can_purchase?: boolean;
  is_owned?: boolean;
}

export type Race = 'human' | 'elf' | 'dark_elf' | 'orc' | 'dwarf';

export interface User {
  id: number;
  nickname: string;
  email: string;
  role: 'user' | 'admin';
  race: Race;
  avatar_level: number;
  total_points: number;
  level: number;
  coins: number;
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
  // Equipment
  equipped_armor_id: number | null;
  equipped_weapon_id: number | null;
  equipped_armor: Equipment | null;
  equipped_weapon: Equipment | null;
  available_grade: string;
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
  race: Race;
}

export interface UpdateHealthData {
  birth_date?: string | null;
  height?: number | null;
  weight?: number | null;
  waist_circumference?: number | null;
  body_fat_percentage?: number | null;
}

export interface LevelProgress {
  current_level: number;
  next_level: number | null;
  points_in_level: number;
  points_needed: number;
  points_remaining: number;
  progress_percent: number;
  is_max_level: boolean;
  difficulty?: string;
}

export interface CoinTransaction {
  id: number;
  user_id: number;
  amount: number;
  reason: string;
  source_type: string | null;
  source_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
