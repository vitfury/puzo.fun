export type ActivityType = 'daily_task' | 'ongoing_rule' | 'music_walk';

export interface Activity {
  id: number;
  name: string;
  type: ActivityType;
  description: string | null;
  points: number;
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
  points_earned: number;
}

export interface GroupedActivities {
  daily_task: Activity[];
  ongoing_rule: Activity[];
  music_walk: Activity[];
}
