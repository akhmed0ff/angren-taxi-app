import { prisma } from '../../../core/db/prisma';
import type { Prisma } from '@prisma/client';

type RideWithRelations = Prisma.RideGetPayload<{
  include: {
    passenger: true;
    driver: true;
  };
}>;

export class RideRepository {
  async create(data: Prisma.RideCreateInput): Promise<RideWithRelations> {
    return prisma.ride.create({
      data,
      include: {
        passenger: true,
        driver: true,
      },
    });
  }

  async findById(id: string): Promise<RideWithRelations | null> {
    return prisma.ride.findUnique({
      where: { id },
      include: {
        passenger: true,
        driver: true,
      },
    });
  }

  async update(id: string, data: Prisma.RideUpdateInput): Promise<RideWithRelations> {
    return prisma.ride.update({
      where: { id },
      data,
      include: {
        passenger: true,
        driver: true,
      },
    });
  }
}

export type { RideWithRelations };
