import { apiClient } from './client';

export interface Activity {
  id: number;
  name: string;
  type: 'daily_task' | 'ongoing_rule' | 'music_walk';
  description: string | null;
  points: number;
  active_from: string | null;
  active_to: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  name: string;
  type: 'daily_task' | 'ongoing_rule' | 'music_walk';
  description?: string;
  points: number;
  active_from?: string | null;
  active_to?: string | null;
  is_active?: boolean;
  order_index?: number;
}

export interface UpdateActivityData extends Partial<CreateActivityData> {}

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
};
