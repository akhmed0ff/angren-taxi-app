import { Order, CreateOrderInput } from '../models/order.model';
import { haversineDistance } from '../utils/distance';
import { getDb } from '../db/db.provider';
import { userRepository } from '../repositories/user.repository';
import { driverRepository } from '../repositories/driver.repository';
import { orderRepository } from '../repositories/order.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { v4 as uuidv4 } from 'uuid';

const PRICE_PER_KM: Record<string, number> = {
  economy: 1500,
  comfort: 2500,
  premium: 4000,
};

const BASE_FARE: Record<string, number> = {
  economy: 3000,
  comfort: 5000,
  premium: 8000,
};

function estimatePrice(category: string, fromLat: number, fromLon: number, toLat: number, toLon: number): number {
  const distKm = haversineDistance(fromLat, fromLon, toLat, toLon);
  const base = BASE_FARE[category] ?? 3000;
  const perKm = PRICE_PER_KM[category] ?? 1500;
  return Math.round(base + perKm * distKm);
}

export class OrderService {
  createOrder(passengerId: string, input: CreateOrderInput): Order {
    const activeOrder = orderRepository.findActiveByPassenger(passengerId);

    if (activeOrder) {
      throw new Error('ALREADY_ACTIVE_ORDER');
    }

    const estimated_price = estimatePrice(
      input.category,
      input.from_latitude,
      input.from_longitude,
      input.to_latitude,
      input.to_longitude
    );

    return orderRepository.create(passengerId, {
      ...input,
      estimatedPrice: estimated_price,
    });
  }

  getOrderById(orderId: string): Order | null {
    return orderRepository.findById(orderId) ?? null;
  }

  /**
   * Проверяет право доступа к заказу.
   * Пассажир видит только свои заказы, водитель — только назначенные ему.
   * Бросает ORDER_ACCESS_DENIED если доступ запрещён.
   */
  assertCanViewOrder(
    order: Order,
    userId: string,
    userType: 'passenger' | 'driver',
    driverRecordId: string | null
  ): void {
    if (userType === 'passenger') {
      if (order.passenger_id !== userId) {
        throw new Error('ORDER_ACCESS_DENIED');
      }
    } else {
      // driver_id в заказе — это drivers.id, не users.id
      if (!driverRecordId || order.driver_id !== driverRecordId) {
        throw new Error('ORDER_ACCESS_DENIED');
      }
    }
  }

  getAvailableOrders(category?: string): Order[] {
    return orderRepository.findPending(category);
  }

  acceptOrder(orderId: string, driverId: string, vehicleId: string): Order {
    getDb().transaction(() => {
      // Проверяем статус водителя внутри транзакции, чтобы исключить TOCTOU:
      // водитель не должен успеть стать offline/busy между проверкой в контроллере и этим UPDATE.
      const driver = driverRepository.findById(driverId);

      if (!driver) {
        throw new Error('DRIVER_NOT_FOUND');
      }
      if (driver.status !== 'online') {
        throw new Error('DRIVER_NOT_AVAILABLE');
      }

      if (!orderRepository.accept(orderId, driverId, vehicleId)) {
        throw new Error('ORDER_NOT_AVAILABLE');
      }

      // Атомарно переводим водителя в busy внутри той же транзакции,
      // чтобы исключить race condition между принятием заказа и сменой статуса.
      driverRepository.setStatusById(driverId, 'busy');

      const acceptedOrder = orderRepository.findById(orderId);
      if (!acceptedOrder) {
        throw new Error('ORDER_NOT_AVAILABLE');
      }

      getDb().execute(
        `INSERT INTO order_history (id, order_id, passenger_id, driver_id, from_address,
         to_address, category, final_price, payment_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          acceptedOrder.id,
          acceptedOrder.passenger_id,
          acceptedOrder.driver_id,
          acceptedOrder.from_address,
          acceptedOrder.to_address,
          acceptedOrder.category,
          acceptedOrder.final_price,
          acceptedOrder.payment_method,
          acceptedOrder.status,
        ]
      );
    });

    return this.getOrderById(orderId) as Order;
  }

  updateStatus(
    orderId: string,
    status: 'in_progress' | 'completed' | 'cancelled',
    finalPrice?: number
  ): Order {
    const order = orderRepository.updateStatus(orderId, status, finalPrice);

    if (status === 'completed') {
      getDb().execute(
        `INSERT INTO order_history (id, order_id, passenger_id, driver_id, from_address,
         to_address, category, final_price, payment_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          order.id,
          order.passenger_id,
          order.driver_id,
          order.from_address,
          order.to_address,
          order.category,
          order.final_price,
          order.payment_method,
          status,
        ]
      );
    }

    return order;
  }

  rejectOrder(orderId: string, driverId: string): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    if (order.driver_id !== driverId) {
      throw new Error('ORDER_ACCESS_DENIED');
    }
    if (order.status !== 'accepted') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    if (!orderRepository.reject(orderId, driverId)) {
      throw new Error('FAILED_TO_REJECT_ORDER');
    }

    // Возвращаем водителя в online статус
    driverRepository.setStatusById(driverId, 'online');

    return this.getOrderById(orderId) as Order;
  }

  arriveAtPickup(orderId: string, driverId: string): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    if (order.driver_id !== driverId) {
      throw new Error('ORDER_ACCESS_DENIED');
    }
    if (order.status !== 'accepted') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    if (!orderRepository.arrivedAtPickup(orderId, driverId)) {
      throw new Error('FAILED_TO_ARRIVE');
    }

    return this.getOrderById(orderId) as Order;
  }

  startOrder(orderId: string, driverId: string): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    if (order.driver_id !== driverId) {
      throw new Error('ORDER_ACCESS_DENIED');
    }
    if (order.status !== 'arrived') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    if (!orderRepository.startRide(orderId, driverId)) {
      throw new Error('FAILED_TO_START_ORDER');
    }

    return this.getOrderById(orderId) as Order;
  }

  completeOrder(orderId: string, driverId: string, finalPrice?: number): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    if (order.driver_id !== driverId) {
      throw new Error('ORDER_ACCESS_DENIED');
    }
    if (order.status !== 'in_progress') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    if (!orderRepository.completeRide(orderId, driverId, finalPrice)) {
      throw new Error('FAILED_TO_COMPLETE_ORDER');
    }

    // Возвращаем водителя в online статус
    driverRepository.setStatusById(driverId, 'online');

    const completedOrder = this.getOrderById(orderId) as Order;

    // Логируем завершение в order_history
    getDb().execute(
      `INSERT INTO order_history (id, order_id, passenger_id, driver_id, from_address,
       to_address, category, final_price, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        completedOrder.id,
        completedOrder.passenger_id,
        completedOrder.driver_id,
        completedOrder.from_address,
        completedOrder.to_address,
        completedOrder.category,
        completedOrder.final_price,
        completedOrder.payment_method,
        'completed',
      ]
    );

    return completedOrder;
  }

  getActiveOrder(userId: string): Order | null {
    const driver = driverRepository.findByUserId(userId);
    if (!driver) {
      return null;
    }
    return orderRepository.findActiveByDriver(driver.id) ?? null;
  }

  getOrderHistory(
    userId: string,
    params: { page?: number; limit?: number; status?: string }
  ): { orders: Order[]; total: number } {
    const driver = driverRepository.findByUserId(userId);
    if (!driver) {
      return { orders: [], total: 0 };
    }

    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const offset = (page - 1) * limit;

    return orderRepository.findByDriver(driver.id, limit, offset, params.status);
  }

  getPassengerOrderHistory(
    passengerId: string,
    params: { page?: number; limit?: number }
  ): { orders: Order[]; total: number } {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const offset = (page - 1) * limit;

    return orderRepository.findByPassenger(passengerId, limit, offset);
  }
}

export const orderService = new OrderService();
