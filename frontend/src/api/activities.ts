import { apiClient } from './client';
import type { Activity, DailyStat, CompleteActivityResponse } from '../types/activity';

export interface ActivityStreakInfo {
  activity_id: number;
  activity_name: string;
  activity_type: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completed: string | null;
  next_milestone: number | null;
  next_milestone_bonus: { coins: number; experience: number } | null;
  days_to_next_milestone: number | null;
}

export interface StreakMilestone {
  days: number;
  bonus: { coins: number; experience: number };
}

export interface StreakSummary {
  total_current_streak: number;
  max_current_streak: number;
  activities_with_streak: number;
  total_activities: number;
}

export interface StreaksResponse {
  streaks: ActivityStreakInfo[];
  summary: StreakSummary;
  milestones: StreakMilestone[];
}

export const activitiesApi = {
  async getTodayActivities(date?: string): Promise<Activity[]> {
    const params = date ? { date } : {};
    const response = await apiClient.get<{ data: Activity[] }>('/activities/today', { params });
    return response.data.data;
  },

  async completeActivity(activityId: number, date?: string): Promise<CompleteActivityResponse> {
    const data = date ? { date } : {};
    const response = await apiClient.post<CompleteActivityResponse>(
      `/activities/${activityId}/complete`,
      data
    );
    return response.data;
  },

  async uncompleteActivity(activityId: number, date?: string): Promise<CompleteActivityResponse> {
    const params = date ? { date } : {};
    const response = await apiClient.delete<CompleteActivityResponse>(
      `/activities/${activityId}/complete`,
      { params }
    );
    return response.data;
  },

  async getHistory(days: number = 30): Promise<DailyStat[]> {
    const response = await apiClient.get<{ data: DailyStat[] }>('/activities/history', {
      params: { days },
    });
    return response.data.data;
  },

  async getStreaks(): Promise<StreaksResponse> {
    const response = await apiClient.get<{ data: StreaksResponse }>('/activities/streaks');
    return response.data.data;
  },

  async toggleFavorite(activityId: number): Promise<{ is_favorite: boolean }> {
    const response = await apiClient.post<{ is_favorite: boolean }>(
      `/activities/${activityId}/favorite`
    );
    return response.data;
  },

  async getFavorites(): Promise<number[]> {
    const response = await apiClient.get<{ data: number[] }>('/activities/favorites');
    return response.data.data;
  },
};
