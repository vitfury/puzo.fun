import { apiClient } from './client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User
} from '../types/user';

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<{ user: User }> {
    const { data } = await apiClient.get<{ user: User }>('/auth/me');
    return data;
  },
};
