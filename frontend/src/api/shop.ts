import { apiClient } from './client';
import type { Equipment, LevelProgress, CoinTransaction } from '../types/user';

interface ShopListResponse {
  success: boolean;
  data: {
    equipment: Equipment[];
    owned_ids: number[];
    user_level: number;
    user_coins: number;
    available_grade: string;
  };
}

interface InventoryResponse {
  success: boolean;
  data: {
    inventory: Equipment[];
    equipped_armor_id: number | null;
    equipped_weapon_id: number | null;
  };
}

interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    equipment: Equipment;
    user_coins: number;
  };
}

interface EquipResponse {
  success: boolean;
  message: string;
  data: {
    equipped_armor_id: number | null;
    equipped_weapon_id: number | null;
    equipped_armor: Equipment | null;
    equipped_weapon: Equipment | null;
  };
}

interface SellResponse {
  success: boolean;
  message: string;
  data: {
    equipment: Equipment;
    user_coins: number;
    coins_received: number;
  };
}

interface LevelProgressResponse {
  success: boolean;
  data: LevelProgress;
}

interface CoinHistoryResponse {
  success: boolean;
  data: {
    transactions: CoinTransaction[];
    balance: number;
  };
}

export const shopApi = {
  /**
   * Get all shop equipment
   */
  async list(type?: 'armor' | 'weapon', grade?: string): Promise<ShopListResponse['data']> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (grade) params.append('grade', grade);
    
    const queryString = params.toString();
    const url = queryString ? `/shop?${queryString}` : '/shop';
    
    const { data } = await apiClient.get<ShopListResponse>(url);
    return data.data;
  },

  /**
   * Get user's inventory
   */
  async inventory(): Promise<InventoryResponse['data']> {
    const { data } = await apiClient.get<InventoryResponse>('/shop/inventory');
    return data.data;
  },

  /**
   * Purchase equipment
   */
  async purchase(equipmentId: number): Promise<PurchaseResponse['data']> {
    const { data } = await apiClient.post<PurchaseResponse>(`/shop/purchase/${equipmentId}`);
    return data.data;
  },

  /**
   * Equip an item
   */
  async equip(equipmentId: number): Promise<EquipResponse['data']> {
    const { data } = await apiClient.post<EquipResponse>(`/shop/equip/${equipmentId}`);
    return data.data;
  },

  /**
   * Unequip an item
   */
  async unequip(type: 'armor' | 'weapon'): Promise<void> {
    await apiClient.post('/shop/unequip', { type });
  },

  /**
   * Sell equipment back to shop
   */
  async sell(equipmentId: number): Promise<SellResponse['data']> {
    const { data } = await apiClient.post<SellResponse>(`/shop/sell/${equipmentId}`);
    return data.data;
  },

  /**
   * Get level progress
   */
  async levelProgress(): Promise<LevelProgress> {
    const { data } = await apiClient.get<LevelProgressResponse>('/shop/level-progress');
    return data.data;
  },

  /**
   * Get coin transaction history
   */
  async coinHistory(days: number = 30): Promise<CoinHistoryResponse['data']> {
    const { data } = await apiClient.get<CoinHistoryResponse>(`/shop/coins/history?days=${days}`);
    return data.data;
  },
};

