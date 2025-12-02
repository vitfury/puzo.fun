import { apiClient } from './client';
import type { Equipment, Race } from '../types/user';

export interface RatingPlayer {
  rank: number;
  id: number;
  nickname: string;
  level: number;
  total_points: number;
  coins: number;
  race: Race;
  current_music_walk_streak: number;
  longest_music_walk_streak: number;
  equipped_armor: Pick<Equipment, 'id' | 'name' | 'type' | 'grade'> | null;
  equipped_weapon: Pick<Equipment, 'id' | 'name' | 'type' | 'grade'> | null;
}

export interface RatingResponse {
  success: boolean;
  data: RatingPlayer[];
  total: number;
}

export type SortField = 'total_points' | 'level' | 'coins' | 'current_music_walk_streak';

export const ratingApi = {
  list: async (sort: SortField = 'total_points', direction: 'asc' | 'desc' = 'desc'): Promise<RatingPlayer[]> => {
    const response = await apiClient.get<RatingResponse>('/rating', {
      params: { sort, direction }
    });
    return response.data.data;
  },
};

