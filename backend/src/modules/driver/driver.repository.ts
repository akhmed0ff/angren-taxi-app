import type { CreateDriverData, Driver, UpdateDriverData } from './driver.types';

const driversStorage: Driver[] = [];

export class DriverRepository {
  async create(data: CreateDriverData): Promise<Driver> {
    const driver: Driver = {
      id: this.generateDriverId(),
      isOnline: data.isOnline ?? true,
      location: data.location,
      currentRideId: data.currentRideId ?? null,
    };

    driversStorage.unshift(driver);
    return driver;
  }

  async findById(id: string): Promise<Driver | null> {
    return driversStorage.find((driver) => driver.id === id) ?? null;
  }

  async findAll(): Promise<Driver[]> {
    return [...driversStorage];
  }

  async findAvailable(): Promise<Driver[]> {
    return driversStorage.filter((driver) => driver.isOnline && driver.currentRideId === null);
  }

  async update(id: string, data: UpdateDriverData): Promise<Driver | null> {
    const driver = await this.findById(id);

    if (!driver) {
      return null;
    }

    if (typeof data.isOnline !== 'undefined') {
      driver.isOnline = data.isOnline;
    }

    if (data.location) {
      driver.location = data.location;
    }

    if (typeof data.currentRideId !== 'undefined') {
      driver.currentRideId = data.currentRideId;
    }

    return driver;
  }

  async delete(id: string): Promise<Driver | null> {
    const index = driversStorage.findIndex((driver) => driver.id === id);

    if (index === -1) {
      return null;
    }

    const [removedDriver] = driversStorage.splice(index, 1);
    return removedDriver;
  }

  async updateLocation(id: string, latitude: number, longitude: number): Promise<Driver> {
    const updated = await this.update(id, {
      location: { lat: latitude, lng: longitude },
    });

    if (!updated) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    return updated;
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<Driver> {
    const updated = await this.update(id, {
      isOnline: isAvailable,
      currentRideId: isAvailable ? null : undefined,
    });

    if (!updated) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    return updated;
  }

  private generateDriverId(): string {
    return `driver_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
