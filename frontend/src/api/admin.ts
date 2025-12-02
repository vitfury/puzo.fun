import { apiClient } from './client';

export type ActivityType = 'daily_task' | 'ongoing_rule' | 'music_walk' | 'training';

export interface Activity {
  id: number;
  name: string;
  type: ActivityType;
  description: string | null;
  points: number;
  coins: number;
  experience: number;
  active_from: string | null;
  active_to: string | null;
  is_active: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateActivityData {
  name: string;
  type: ActivityType;
  description?: string;
  points?: number;
  coins?: number;
  experience?: number;
  active_from?: string | null;
  active_to?: string | null;
  is_active?: boolean;
  order_index?: number;
}

export interface UpdateActivityData extends Partial<CreateActivityData> {}

export interface GameSetting {
  id: number;
  key: string;
  value: number | string | boolean;
  type: 'integer' | 'float' | 'string' | 'boolean' | 'json';
  group: string;
  description: string | null;
}

// Public API for localizations (accessible to all users)
export const localizationApi = {
  getLocalizations: async (): Promise<Record<string, any>> => {
    const response = await apiClient.get('/localizations');
    return response.data.data;
  },
};

export const adminApi = {
  // Activities CRUD
  getActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get('/admin/activities');
    return response.data.data;
  },

  getActivity: async (id: number): Promise<Activity> => {
    const response = await apiClient.get(`/admin/activities/${id}`);
    return response.data.data;
  },

  createActivity: async (data: CreateActivityData): Promise<Activity> => {
    const response = await apiClient.post('/admin/activities', data);
    return response.data.data;
  },

  updateActivity: async (id: number, data: UpdateActivityData): Promise<Activity> => {
    const response = await apiClient.put(`/admin/activities/${id}`, data);
    return response.data.data;
  },

  deleteActivity: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/activities/${id}`);
  },

  // Localization management
  getLocalizations: async (): Promise<Record<string, any>> => {
    const response = await apiClient.get('/admin/localizations');
    return response.data.data;
  },

  getLocalization: async (locale: string): Promise<any> => {
    const response = await apiClient.get(`/admin/localizations/${locale}`);
    return response.data.data;
  },

  updateLocalizationKey: async (locale: string, key: string, value: string): Promise<void> => {
    await apiClient.post('/admin/localizations/update-key', {
      locale,
      key,
      value,
    });
  },

  updateLocalization: async (locale: string, translations: any): Promise<void> => {
    await apiClient.put(`/admin/localizations/${locale}`, {
      translations,
    });
  },

  // Game Settings
  getSettings: async (): Promise<{ settings: GameSetting[]; grouped: Record<string, GameSetting[]> }> => {
    const response = await apiClient.get('/admin/settings');
    return response.data.data;
  },

  getSettingsByGroup: async (group: string): Promise<GameSetting[]> => {
    const response = await apiClient.get(`/admin/settings/group/${group}`);
    return response.data.data;
  },

  updateSetting: async (key: string, value: number | string): Promise<void> => {
    await apiClient.put(`/admin/settings/${key}`, { value });
  },

  bulkUpdateSettings: async (settings: Array<{ key: string; value: number | string }>): Promise<void> => {
    await apiClient.post('/admin/settings/bulk', { settings });
  },

  // Dev tools - User stats
  getUserStats: async (): Promise<{ user_id: number; nickname: string; coins: number; total_points: number; level: number }> => {
    const response = await apiClient.get('/admin/settings/user-stats');
    return response.data.data;
  },

  updateUserStats: async (userId: number, data: { coins?: number; total_points?: number }): Promise<{ coins: number; total_points: number; level: number }> => {
    const response = await apiClient.post('/admin/settings/user-stats', {
      user_id: userId,
      ...data,
    });
    return response.data.data;
  },

  updateUserRace: async (userId: number, race: string): Promise<{ race: string }> => {
    const response = await apiClient.post('/admin/settings/user-race', {
      user_id: userId,
      race,
    });
    return response.data.data;
  },
};
