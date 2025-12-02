export type ActivityType = 'daily_task' | 'ongoing_rule' | 'training' | 'music_walk';

export interface Activity {
  id: number;
  name: string;
  type: ActivityType;
  description: string | null;
  points: number; // Legacy field
  coins: number;
  experience: number;
  active_from: string | null;
  active_to: string | null;
  is_active: boolean;
  order_index: number;
  is_completed?: boolean;
  completed_at?: string;
}

export interface DailyStat {
  id: number;
  date: string;
  steps: number;
  calories_burned: number;
  calories_consumed: number;
  points_earned: number;
  activities_completed: number;
}

export interface CompleteActivityResponse {
  message: string;
  experience_earned: number;
  coins_earned: number;
  new_level: number;
  new_total_points: number;
  new_coins: number;
}

export interface GroupedActivities {
  daily_task: Activity[];
  ongoing_rule: Activity[];
  training: Activity[];
  music_walk: Activity[];
}
