import { apiClient } from './api';
import type { Payment, PaymentMethod } from '../types';

export async function processPayment(
  orderId: string,
  method: PaymentMethod,
  amount: number,
): Promise<Payment> {
  const { data } = await apiClient.post<Payment>('/payments', { orderId, method, amount });
  return data;
}

export async function getPaymentHistory(): Promise<Payment[]> {
  const { data } = await apiClient.get<Payment[]>('/payments');
  return data;
}
