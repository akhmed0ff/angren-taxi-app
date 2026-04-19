import api from './api';
import { Driver, DriverLocation, DriverStats, ApiResponse } from '../types';

export const driverService = {
  async getProfile(): Promise<Driver> {
    const { data } = await api.get<ApiResponse<Driver>>('/drivers/me');
    return data.data;
  },

  async toggleOnline(isOnline: boolean): Promise<{ isOnline: boolean }> {
    const { data } = await api.put<ApiResponse<{ isOnline: boolean }>>('/drivers/status', {
      isOnline,
    });
    return data.data;
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
    const { data } = await api.get<ApiResponse<DriverStats>>('/drivers/stats');
    return data.data;
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
