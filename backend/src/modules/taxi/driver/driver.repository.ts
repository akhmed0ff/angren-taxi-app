import { prisma } from '../../../core/db/prisma';
import type { Driver, Prisma } from '@prisma/client';

export class TaxiDriverRepository {
  async create(data: Prisma.DriverCreateInput): Promise<Driver> {
    return prisma.driver.create({ data });
  }

  async findById(id: string): Promise<Driver | null> {
    return prisma.driver.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.DriverUpdateInput): Promise<Driver> {
    return prisma.driver.update({
      where: { id },
      data,
    });
  }

  async findByStatus(status: string): Promise<Driver[]> {
    return prisma.driver.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
