import { apiClient } from './api';
import type { BonusTransaction } from '../types';

interface BonusHistoryParams {
  page?: number;
  limit?: number;
}

interface BonusHistoryResponse {
  transactions: BonusTransaction[];
  total: number;
}

export async function getBonusBalance(): Promise<number> {
  const { data } = await apiClient.get<{ balance: number }>('/bonuses/balance');
  return data.balance;
}

export async function getBonusHistory(params?: BonusHistoryParams): Promise<BonusHistoryResponse> {
  const { data } = await apiClient.get<BonusHistoryResponse>('/bonuses/history', { params });
  return data;
}
