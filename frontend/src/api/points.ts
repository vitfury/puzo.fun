import { apiClient } from './client';
import type { PointTransaction } from '../types/points';

export interface BalanceResponse {
  balance: number;
}

export interface TransactionsResponse {
  data: PointTransaction[];
}

export const pointsApi = {
  getBalance: async (): Promise<number> => {
    const response = await apiClient.get<BalanceResponse>('/points/balance');
    return response.data.balance;
  },

  getTransactions: async (days = 30): Promise<PointTransaction[]> => {
    const response = await apiClient.get<TransactionsResponse>('/points/transactions', {
      params: { days },
    });
    return response.data.data;
  },
};
