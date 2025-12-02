import { apiClient } from './client';

export interface HealthDataPoint {
  date: string;
  weight: number | null;
  bmi: number | null;
  waist: number | null;
  bodyFat: number | null;
}

export interface HealthTrend {
  weight: number | null;
  bmi: number | null;
  waist: number | null;
}

export interface HealthChartData {
  history: HealthDataPoint[];
  trend: HealthTrend;
}

export interface DailyActivityData {
  date: string;
  completed: number;
  points: number;
}

export interface ActivitiesChartData {
  daily: DailyActivityData[];
  total: number;
  avgPerDay: number;
}

export interface StreakItem {
  activityId: number;
  activityName: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompleted: string | null;
}

export interface StreaksData {
  items: StreakItem[];
  totalActive: number;
}

export interface DailyExperienceData {
  date: string;
  amount: number;
}

export interface ExperienceChartData {
  daily: DailyExperienceData[];
  total: number;
  avgPerDay: number;
}

export interface DailyCoinData {
  date: string;
  earned: number;
  spent: number;
}

export interface CoinsChartData {
  daily: DailyCoinData[];
  totalEarned: number;
  totalSpent: number;
  net: number;
}

export interface SummaryData {
  daysWithActivity: number;
  totalDays: number;
  activityRate: number;
}

export interface ProfileChartsData {
  health: HealthChartData;
  activities: ActivitiesChartData;
  streaks: StreaksData;
  experience: ExperienceChartData;
  coins: CoinsChartData;
  summary: SummaryData;
}

export const profileApi = {
  async getChartsData(days: number = 60): Promise<ProfileChartsData> {
    const response = await apiClient.get<{ success: boolean; data: ProfileChartsData }>(
      '/profile/charts',
      { params: { days } }
    );
    return response.data.data;
  },
};

