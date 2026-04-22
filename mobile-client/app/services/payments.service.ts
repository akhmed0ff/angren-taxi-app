import { apiClient } from './api';
import type { Payment, PaymentMethod } from '../types';

export async function processPayment(
  orderId: string,
  method: PaymentMethod,
  amount?: number,
): Promise<Payment> {
  const { data: resp } = await apiClient.post<{ success: boolean; data: Payment }>('/payments/process', { orderId, method });
  return resp.data;
}

export async function getPaymentHistory(): Promise<Payment[]> {
  const { data } = await apiClient.get<Payment[]>('/payments');
  return data;
}
