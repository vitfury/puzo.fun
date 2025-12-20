export interface Genre {
  id: number;
  parent_id: number | null; // Legacy single parent (for backward compatibility)
  parent_ids?: number[]; // All parent IDs (from both legacy and many-to-many)
  parents?: Genre[]; // Many-to-many parents
  name: string;
  description: string | null;
  playlist_url: string | null;
  year: number | null;
  x_position: number;
  y_position: number;
  order_index: number;
  children?: Genre[];
  comments_count?: number;
  user_progress?: {
    is_available: boolean;
    is_completed: boolean;
    completed_at: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GenreComment {
  id: number;
  user: {
    id: number;
    name: string;
  };
  genre_id: number;
  comment: string;
  created_at: string;
}

export interface GenreTreeResponse {
  data: Genre[];
}

export interface GenreFormData {
  parent_id: number | null; // Legacy single parent
  parent_ids?: number[]; // Many-to-many parents
  name: string;
  description: string;
  playlist_url: string;
  year: number | null;
  x_position: number;
  y_position: number;
  order_index: number;
}
