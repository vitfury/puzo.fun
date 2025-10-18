import { apiClient } from './client';
import type { Activity, DailyStat, CompleteActivityResponse } from '../types/activity';

export const activitiesApi = {
  async getTodayActivities(): Promise<Activity[]> {
    const response = await apiClient.get<{ data: Activity[] }>('/activities/today');
    return response.data.data;
  },

  async completeActivity(activityId: number): Promise<CompleteActivityResponse> {
    const response = await apiClient.post<CompleteActivityResponse>(
      `/activities/${activityId}/complete`
    );
    return response.data;
  },

  async uncompleteActivity(activityId: number): Promise<void> {
    await apiClient.delete(`/activities/${activityId}/complete`);
  },

  async getHistory(days: number = 30): Promise<DailyStat[]> {
    const response = await apiClient.get<{ data: DailyStat[] }>('/activities/history', {
      params: { days },
    });
    return response.data.data;
  },
};
