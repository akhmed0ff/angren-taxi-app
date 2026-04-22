import api from './api';
import { Driver, DriverLocation, DriverStats, ApiResponse } from '../types';

export const driverService = {
  async getProfile(): Promise<Driver> {
    const { data } = await api.get<ApiResponse<Driver>>('/drivers/me');
    return data.data;
  },

  async toggleOnline(isOnline: boolean): Promise<{ isOnline: boolean }> {
    const { data } = await api.put<ApiResponse<{ status: string }>>('/drivers/status', {
      isOnline,
    });
    return { isOnline: (data.data as any).status === 'online' };
  },

  async updateLocation(location: DriverLocation): Promise<void> {
    await api.put('/drivers/location', {
      latitude: location.latitude,
      longitude: location.longitude,
      heading: location.heading,
      speed: location.speed,
    });
  },

  async getStats(): Promise<DriverStats> {
    const { data } = await api.get<ApiResponse<{ totalRides: number; rating: number; balance: number }>>('/drivers/stats');
    // TODO: backend to return full stats breakdown (completedOrders, cancelledOrders, todayOrders, etc.)
    return {
      totalOrders: data.data.totalRides,
      completedOrders: data.data.totalRides,
      cancelledOrders: 0,
      rating: data.data.rating,
      totalEarnings: data.data.balance,
      todayEarnings: 0,
      todayOrders: 0,
      acceptanceRate: 100,
    };
  },

  async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<void> {
    await api.put('/drivers/profile', updates);
  },

  async updateVehicle(updates: {
    make?: string;
    model?: string;
    year?: number;
    plate?: string;
    color?: string;
    category?: string;
  }): Promise<void> {
    await api.put('/drivers/vehicle', updates);
  },
};
