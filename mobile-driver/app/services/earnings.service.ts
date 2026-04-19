import api from './api';
import { EarningsSummary, Payout, ApiResponse } from '../types';

export const earningsService = {
  async getEarnings(period: 'week' | 'month' | 'all' = 'week'): Promise<EarningsSummary> {
    const { data } = await api.get<ApiResponse<EarningsSummary>>('/earnings', {
      params: { period },
    });
    return data.data;
  },

  async requestPayout(amount: number): Promise<Payout> {
    const { data } = await api.post<ApiResponse<Payout>>('/earnings/payout', { amount });
    return data.data;
  },

  async getPayouts(): Promise<Payout[]> {
    const { data } = await api.get<ApiResponse<Payout[]>>('/earnings/payouts');
    return data.data;
  },
};
