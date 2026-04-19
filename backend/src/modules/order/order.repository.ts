import { prisma } from '@/core/db/prisma';
import type { Order, Prisma } from '@prisma/client';

export class OrderRepository {
  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({ data });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { driver: true },
    });
  }

  async findAll(): Promise<Order[]> {
    return prisma.order.findMany({
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { status },
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDriverId(driverId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { driverId },
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
      include: { driver: true },
    });
  }

  async delete(id: string): Promise<Order> {
    return prisma.order.delete({ where: { id } });
  }
}
