import { DriverRepository } from './driver.repository';
import { Prisma } from '@prisma/client';
import type { Driver } from '@prisma/client';

export type DriverStatus = 'IDLE' | 'BUSY' | 'OFFLINE';

const EARTH_RADIUS_KM = 6371;

const IDLE_STATUS: DriverStatus = 'IDLE';
const NON_IDLE_STATUSES: DriverStatus[] = ['BUSY', 'OFFLINE'];

export class DriverServiceError extends Error {
  constructor(
    public code: 'DRIVER_NOT_FOUND' | 'INVALID_STATUS' | 'INTERNAL_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'DriverServiceError';
  }
}

export class DriverService {
  private repository: DriverRepository;

  constructor() {
    this.repository = new DriverRepository();
  }

  private isPrismaNotFoundError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const lat1Rad = this.toRadians(lat1);
    const lat2Rad = this.toRadians(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }

  // Current schema stores availability as boolean. Keep service API in taxi status terms.
  private statusToAvailability(status: DriverStatus): boolean {
    if (status === IDLE_STATUS) {
      return true;
    }

    if (NON_IDLE_STATUSES.includes(status)) {
      return false;
    }

    throw new DriverServiceError('INVALID_STATUS', `Unsupported driver status: ${status}`);
  }

  async createDriver(name: string, lat: number, lng: number): Promise<Driver> {
    return this.repository.create({
      name,
      latitude: lat,
      longitude: lng,
      isAvailable: true,
    });
  }

  async getDriverById(id: string): Promise<Driver | null> {
    return this.repository.findById(id);
  }

  async getAllDrivers(): Promise<Driver[]> {
    return this.repository.findAll();
  }

  // IDLE drivers in current schema are represented by isAvailable=true.
  async getAvailableDrivers(): Promise<Driver[]> {
    return this.repository.findAvailable();
  }

  // Optimized for frequent realtime calls (single UPDATE, no pre-read).
  async updateLocation(driverId: string, lat: number, lng: number): Promise<Driver> {
    try {
      return await this.repository.updateLocation(driverId, lat, lng);
    } catch (error) {
      if (this.isPrismaNotFoundError(error)) {
        throw new DriverServiceError('DRIVER_NOT_FOUND', `Driver ${driverId} not found`);
      }

      throw error;
    }
  }

  async setStatus(driverId: string, status: DriverStatus): Promise<Driver> {
    try {
      const isAvailable = this.statusToAvailability(status);
      return await this.repository.updateAvailability(driverId, isAvailable);
    } catch (error) {
      if (error instanceof DriverServiceError) {
        throw error;
      }

      if (this.isPrismaNotFoundError(error)) {
        throw new DriverServiceError('DRIVER_NOT_FOUND', `Driver ${driverId} not found`);
      }

      throw new DriverServiceError('INTERNAL_ERROR', 'Failed to set driver status');
    }
  }

  async findNearestDriver(lat: number, lng: number): Promise<Driver> {
    const availableDrivers = await this.getAvailableDrivers();

    if (availableDrivers.length === 0) {
      throw new DriverServiceError('DRIVER_NOT_FOUND', 'No available (IDLE) drivers found');
    }

    let nearestDriver = availableDrivers[0];
    let minDistance = this.calculateDistance(lat, lng, nearestDriver.latitude, nearestDriver.longitude);

    for (let i = 1; i < availableDrivers.length; i += 1) {
      const candidate = availableDrivers[i];
      const candidateDistance = this.calculateDistance(lat, lng, candidate.latitude, candidate.longitude);

      if (candidateDistance < minDistance) {
        minDistance = candidateDistance;
        nearestDriver = candidate;
      }
    }

    return nearestDriver;
  }

  // Backward-compatible aliases
  async updateDriverLocation(id: string, latitude: number, longitude: number): Promise<Driver> {
    return this.updateLocation(id, latitude, longitude);
  }

  async updateDriverAvailability(id: string, isAvailable: boolean): Promise<Driver> {
    return this.setStatus(id, isAvailable ? 'IDLE' : 'BUSY');
  }

  async deleteDriver(id: string): Promise<Driver> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      if (this.isPrismaNotFoundError(error)) {
        throw new DriverServiceError('DRIVER_NOT_FOUND', `Driver ${id} not found`);
      }

      throw new DriverServiceError('INTERNAL_ERROR', 'Failed to delete driver');
    }
  }
}
