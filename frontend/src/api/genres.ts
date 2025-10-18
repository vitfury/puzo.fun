import { apiClient } from './client';
import { Genre, GenreComment, GenreTreeResponse } from '../types/genre';

export const genreApi = {
  // Public endpoints
  getTree: async (): Promise<GenreTreeResponse> => {
    const { data } = await apiClient.get<GenreTreeResponse>('/genres/tree');
    return data;
  },

  getGenre: async (id: number): Promise<{ data: Genre }> => {
    const { data } = await apiClient.get<{ data: Genre }>(`/genres/${id}`);
    return data;
  },

  completeGenre: async (id: number): Promise<{
    message: string;
    progress: { is_completed: boolean };
    unlocked_count: number;
    can_unlock: boolean;
    unlock_reason: string | null;
  }> => {
    const { data } = await apiClient.post(`/genres/${id}/complete`);
    return data;
  },

  addComment: async (id: number, comment: string): Promise<{ data: GenreComment }> => {
    const { data } = await apiClient.post(`/genres/${id}/comments`, { comment });
    return data;
  },

  // Admin endpoints
  admin: {
    list: async (): Promise<GenreTreeResponse> => {
      const { data } = await apiClient.get<GenreTreeResponse>('/admin/genres');
      return data;
    },

    create: async (genre: Partial<Genre>): Promise<{ data: Genre }> => {
      const { data } = await apiClient.post<{ data: Genre }>('/admin/genres', genre);
      return data;
    },

    update: async (id: number, genre: Partial<Genre>): Promise<{ data: Genre }> => {
      const { data } = await apiClient.put<{ data: Genre }>(`/admin/genres/${id}`, genre);
      return data;
    },

    delete: async (id: number): Promise<{ message: string }> => {
      const { data } = await apiClient.delete<{ message: string }>(`/admin/genres/${id}`);
      return data;
    },
  },
};
