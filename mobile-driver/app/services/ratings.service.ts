import api from './api';
import { RatingsSummary, Review, ApiResponse } from '../types';

export const ratingsService = {
  async getRatings(): Promise<RatingsSummary> {
    const { data } = await api.get<ApiResponse<RatingsSummary>>('/ratings/driver');
    return data.data;
  },

  async getReviews(page = 1, limit = 20): Promise<Review[]> {
    const { data } = await api.get<ApiResponse<Review[]>>('/ratings/driver/reviews', {
      params: { page, limit },
    });
    return data.data;
  },

  async ratePassenger(
    orderId: string,
    rating: number,
    comment?: string,
  ): Promise<void> {
    await api.post('/ratings/passenger', { orderId, rating, comment });
  },
};
