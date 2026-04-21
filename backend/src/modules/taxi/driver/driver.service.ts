import { Prisma } from '@prisma/client';
import type { Driver } from '@prisma/client';
import { TaxiDriverRepository } from './driver.repository';
import { DRIVER_STATUS, type DriverStatus } from '../types';

const EARTH_RADIUS_KM = 6371;

export class TaxiDriverServiceError extends Error {
  constructor(
    public code: 'DRIVER_NOT_FOUND' | 'INVALID_STATUS' | 'INTERNAL_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'TaxiDriverServiceError';
  }
}

export class TaxiDriverService {
  private readonly repository: TaxiDriverRepository;

  constructor() {
    this.repository = new TaxiDriverRepository();
  }

  private isPrismaNotFoundError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2025';
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }

  async createDriver(name: string, latitude: number, longitude: number): Promise<Driver> {
    try {
      return await this.repository.create({
        name,
        latitude,
        longitude,
        status: DRIVER_STATUS.IDLE,
        isAvailable: true,
      });
    } catch {
      throw new TaxiDriverServiceError('INTERNAL_ERROR', 'Failed to create driver');
    }
  }

  async updateLocation(driverId: string, latitude: number, longitude: number): Promise<Driver> {
    try {
      return await this.repository.update(driverId, { latitude, longitude });
    } catch (error) {
      if (this.isPrismaNotFoundError(error)) {
        throw new TaxiDriverServiceError('DRIVER_NOT_FOUND', `Driver ${driverId} not found`);
      }
      throw new TaxiDriverServiceError('INTERNAL_ERROR', 'Failed to update driver location');
    }
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return this.repository.findByStatus('IDLE');
  }

  async setStatus(driverId: string, status: DriverStatus): Promise<Driver> {
    if (!Object.values(DRIVER_STATUS).includes(status)) {
      throw new TaxiDriverServiceError('INVALID_STATUS', `Unsupported status: ${status}`);
    }

    try {
      return await this.repository.update(driverId, {
        status,
        isAvailable: status === DRIVER_STATUS.IDLE,
      });
    } catch (error) {
      if (this.isPrismaNotFoundError(error)) {
        throw new TaxiDriverServiceError('DRIVER_NOT_FOUND', `Driver ${driverId} not found`);
      }
      throw new TaxiDriverServiceError('INTERNAL_ERROR', 'Failed to set driver status');
    }
  }

  async findNearestDriver(latitude: number, longitude: number): Promise<Driver> {
    const idleDrivers = await this.getAvailableDrivers();

    if (idleDrivers.length === 0) {
      throw new TaxiDriverServiceError('DRIVER_NOT_FOUND', 'No IDLE drivers available');
    }

    let nearest = idleDrivers[0];
    let bestDistance = this.calculateDistance(
      latitude,
      longitude,
      nearest.latitude,
      nearest.longitude,
    );

    for (let i = 1; i < idleDrivers.length; i += 1) {
      const candidate = idleDrivers[i];
      const distance = this.calculateDistance(
        latitude,
        longitude,
        candidate.latitude,
        candidate.longitude,
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = candidate;
      }
    }

    return nearest;
  }
}
