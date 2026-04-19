import { prisma } from '@/core/db/prisma';
import type { Driver, Prisma } from '@prisma/client';

export class DriverRepository {
  async create(data: Prisma.DriverCreateInput): Promise<Driver> {
    return prisma.driver.create({ data });
  }

  async findById(id: string): Promise<Driver | null> {
    return prisma.driver.findUnique({ where: { id } });
  }

  async findAll(): Promise<Driver[]> {
    return prisma.driver.findMany();
  }

  async findAvailable(): Promise<Driver[]> {
    return prisma.driver.findMany({
      where: { isAvailable: true },
    });
  }

  async update(id: string, data: Prisma.DriverUpdateInput): Promise<Driver> {
    return prisma.driver.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Driver> {
    return prisma.driver.delete({ where: { id } });
  }

  async updateLocation(id: string, latitude: number, longitude: number): Promise<Driver> {
    return this.update(id, { latitude, longitude });
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<Driver> {
    return this.update(id, { isAvailable });
  }
}
