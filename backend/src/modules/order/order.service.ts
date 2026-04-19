import { OrderRepository } from './order.repository';
import { DriverRepository } from '@/modules/driver/driver.repository';
import { prisma } from '@/core/db/prisma';
import type { Order } from '@prisma/client';

// Constants
const ORDER_STATUS = {
  SEARCHING: 'searching',
  ASSIGNED: 'assigned',
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

const DRIVER_STATUS = {
  IDLE: 'idle',
  BUSY: 'busy',
  OFFLINE: 'offline',
} as const;

const PRICING = {
  BASE_PRICE: 5000, // in cents
  RATE_PER_KM: 1500, // in cents
};

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  [ORDER_STATUS.SEARCHING]: [ORDER_STATUS.ASSIGNED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ASSIGNED]: [ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ON_THE_WAY]: [ORDER_STATUS.ARRIVED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ARRIVED]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COMPLETED]: [], // Terminal state
  [ORDER_STATUS.CANCELLED]: [], // Terminal state
};

export interface CreateOrderDTO {
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
}

export interface AssignedOrder extends Order {
  distance: number;
  price: number;
}

export class OrderServiceError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OrderServiceError';
  }
}

export class OrderService {
  private orderRepository: OrderRepository;
  private driverRepository: DriverRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.driverRepository = new DriverRepository();
  }

  /**
   * Haversine formula to calculate distance between two points
   * @returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate order price based on distance
   * @returns price in cents
   */
  private calculatePrice(distance: number): number {
    const price = PRICING.BASE_PRICE + Math.ceil(distance) * PRICING.RATE_PER_KM;
    return price;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions) {
      throw new OrderServiceError('INVALID_CURRENT_STATUS', `Invalid current status: ${currentStatus}`);
    }

    if (!allowedTransitions.includes(newStatus)) {
      throw new OrderServiceError(
        'INVALID_STATUS_TRANSITION',
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Create order with distance and price calculation
   */
  async createOrder(dto: CreateOrderDTO): Promise<AssignedOrder> {
    try {
      const distance = this.calculateDistance(
        dto.fromLatitude,
        dto.fromLongitude,
        dto.toLatitude,
        dto.toLongitude,
      );

      const price = this.calculatePrice(distance);

      const order = await this.orderRepository.create({
        fromLatitude: dto.fromLatitude,
        fromLongitude: dto.fromLongitude,
        toLatitude: dto.toLatitude,
        toLongitude: dto.toLongitude,
        status: ORDER_STATUS.SEARCHING,
        price,
        distance,
      });

      return {
        ...order,
        distance,
        price,
      };
    } catch (error) {
      if (error instanceof OrderServiceError) throw error;
      throw new OrderServiceError('CREATE_ORDER_ERROR', 'Failed to create order');
    }
  }

  /**
   * Auto-assign nearest available driver
   */
  async assignDriver(orderId: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        throw new OrderServiceError('ORDER_NOT_FOUND', `Order ${orderId} not found`);
      }

      if (order.status !== ORDER_STATUS.SEARCHING) {
        throw new OrderServiceError(
          'INVALID_ORDER_STATUS',
          `Cannot assign driver to order with status ${order.status}`,
        );
      }

      // Get all idle drivers
      const drivers = await prisma.driver.findMany({
        where: { isAvailable: true },
      });

      if (drivers.length === 0) {
        throw new OrderServiceError('NO_DRIVERS_AVAILABLE', 'No available drivers found');
      }

      // Calculate distance to each driver and find the nearest
      let nearestDriver = drivers[0];
      let minDistance = this.calculateDistance(
        order.fromLatitude,
        order.fromLongitude,
        nearestDriver.latitude,
        nearestDriver.longitude,
      );

      for (let i = 1; i < drivers.length; i++) {
        const driver = drivers[i];
        const distance = this.calculateDistance(
          order.fromLatitude,
          order.fromLongitude,
          driver.latitude,
          driver.longitude,
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      }

      // Update order and driver in transaction
      const updatedOrder = await prisma.$transaction(async (tx) => {
        await tx.driver.update({
          where: { id: nearestDriver.id },
          data: { isAvailable: false },
        });

        return tx.order.update({
          where: { id: orderId },
          data: {
            driverId: nearestDriver.id,
            status: ORDER_STATUS.ASSIGNED,
          },
          include: { driver: true },
        });
      });

      return updatedOrder;
    } catch (error) {
      if (error instanceof OrderServiceError) throw error;
      throw new OrderServiceError('ASSIGN_DRIVER_ERROR', 'Failed to assign driver');
    }
  }

  /**
   * Update order status with validation
   */
  async updateOrderStatus(orderId: string, newStatus: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        throw new OrderServiceError('ORDER_NOT_FOUND', `Order ${orderId} not found`);
      }

      this.validateStatusTransition(order.status, newStatus);

      // If completing order, free up the driver
      if (newStatus === ORDER_STATUS.COMPLETED && order.driverId) {
        await prisma.$transaction(async (tx) => {
          await tx.driver.update({
            where: { id: order.driverId! },
            data: { isAvailable: true },
          });

          await tx.order.update({
            where: { id: orderId },
            data: { status: newStatus },
          });
        });
      } else {
        await this.orderRepository.update(orderId, { status: newStatus });
      }

      return (await this.orderRepository.findById(orderId))!;
    } catch (error) {
      if (error instanceof OrderServiceError) throw error;
      throw new OrderServiceError('UPDATE_STATUS_ERROR', 'Failed to update order status');
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findById(id);
    } catch (error) {
      throw new OrderServiceError('GET_ORDER_ERROR', 'Failed to fetch order');
    }
  }

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      return await this.orderRepository.findAll();
    } catch (error) {
      throw new OrderServiceError('GET_ORDERS_ERROR', 'Failed to fetch orders');
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findByStatus(status);
    } catch (error) {
      throw new OrderServiceError('GET_ORDERS_ERROR', 'Failed to fetch orders');
    }
  }

  /**
   * Get driver's orders
   */
  async getDriverOrders(driverId: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findByDriverId(driverId);
    } catch (error) {
      throw new OrderServiceError('GET_ORDERS_ERROR', 'Failed to fetch driver orders');
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        throw new OrderServiceError('ORDER_NOT_FOUND', `Order ${orderId} not found`);
      }

      if (order.status === ORDER_STATUS.COMPLETED) {
        throw new OrderServiceError('CANNOT_CANCEL_COMPLETED', 'Cannot cancel completed order');
      }

      // Free up driver if assigned
      if (order.driverId) {
        await prisma.$transaction(async (tx) => {
          await tx.driver.update({
            where: { id: order.driverId! },
            data: { isAvailable: true },
          });

          await tx.order.update({
            where: { id: orderId },
            data: { status: ORDER_STATUS.CANCELLED },
          });
        });
      } else {
        await this.orderRepository.update(orderId, { status: ORDER_STATUS.CANCELLED });
      }

      return (await this.orderRepository.findById(orderId))!;
    } catch (error) {
      if (error instanceof OrderServiceError) throw error;
      throw new OrderServiceError('CANCEL_ORDER_ERROR', 'Failed to cancel order');
    }
  }

  /**
   * Delete order (admin only)
   */
  async deleteOrder(id: string): Promise<Order> {
    try {
      return await this.orderRepository.delete(id);
    } catch (error) {
      throw new OrderServiceError('DELETE_ORDER_ERROR', 'Failed to delete order');
    }
  }
}
