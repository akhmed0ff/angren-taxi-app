import { apiClient } from './api';
import type { Driver, Location } from '../types';

export async function getAvailableDrivers(
  location: Location,
  radius = 5000,
): Promise<Driver[]> {
  const { data } = await apiClient.get<Driver[]>('/drivers/available', {
    params: { lat: location.latitude, lng: location.longitude, radius },
  });
  return data;
}

export async function trackDriver(driverId: string): Promise<Location> {
  const { data } = await apiClient.get<Location>(`/drivers/${driverId}/location`);
  return data;
}
