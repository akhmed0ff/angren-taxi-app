import { prisma } from '../../../core/db/prisma';
import type { Passenger, Prisma } from '@prisma/client';

export class PassengerRepository {
  async create(data: Prisma.PassengerCreateInput): Promise<Passenger> {
    return prisma.passenger.create({ data });
  }

  async findById(id: string): Promise<Passenger | null> {
    return prisma.passenger.findUnique({ where: { id } });
  }
}
