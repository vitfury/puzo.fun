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
  daily_streak_enabled: boolean;
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
  daily_streak_enabled?: boolean;
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

  // Analytics
  getDailyAnalytics: async (params?: {
    user_id?: number;
    start_date?: string;
    end_date?: string;
    days?: number;
  }): Promise<{
    data: Array<{
      date: string;
      user_id: number;
      user_nickname: string;
      user_email: string;
      activities: Array<{
        id: number;
        name: string;
        type: string;
        coins: number;
        experience: number;
        completed_at: string;
      }>;
      coin_transactions: Array<{
        id: number;
        amount: number;
        reason: string;
        created_at: string;
        metadata: any;
      }>;
      point_transactions: Array<{
        id: number;
        amount: number;
        reason: string;
        created_at: string;
        metadata: any;
      }>;
      summary: {
        activities_count: number;
        coins_earned: number;
        coins_spent: number;
        coins_net: number;
        points_earned: number;
        points_spent: number;
        points_net: number;
      };
    }>;
    meta: {
      start_date: string;
      end_date: string;
      total_days: number;
      total_users: number;
    };
  }> => {
    const response = await apiClient.get('/admin/analytics/daily', { params });
    return response.data;
  },

  getAnalyticsSummary: async (params?: {
    user_id?: number;
    start_date?: string;
    end_date?: string;
    days?: number;
  }): Promise<{
    data: {
      total_users: number;
      total_activities: number;
      total_coins_earned: number;
      total_coins_spent: number;
      total_coins_net: number;
      total_points_earned: number;
      total_points_spent: number;
      total_points_net: number;
    };
    meta: {
      start_date: string;
      end_date: string;
    };
  }> => {
    const response = await apiClient.get('/admin/analytics/summary', { params });
    return response.data;
  },

  getAnalyticsUsers: async (): Promise<Array<{
    id: number;
    nickname: string;
    email: string;
    role: string;
  }>> => {
    const response = await apiClient.get('/admin/analytics/users');
    return response.data.data;
  },

  getTransactionLog: async (params?: {
    user_id?: number;
    start_date?: string;
    end_date?: string;
    days?: number;
    type?: 'coins' | 'points' | 'all';
    limit?: number;
  }): Promise<{
    data: Array<{
      id: number;
      type: 'coin' | 'point';
      user_id: number;
      user_nickname: string;
      user_email: string;
      amount: number;
      reason: string;
      metadata: any;
      created_at: string;
      date: string;
    }>;
    totals: {
      coins_earned: number;
      coins_spent: number;
      points_earned: number;
      points_spent: number;
    };
    meta: {
      start_date: string;
      end_date: string;
      total_transactions: number;
      type: string;
    };
  }> => {
    const response = await apiClient.get('/admin/analytics/transactions', { params });
    return response.data;
  },
};
