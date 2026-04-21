import { Order, CreateOrderInput } from '../models/order.model';
import { haversineDistance } from '../utils/distance';
import { orderRepository } from '../repositories/order.repository';

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
    const activeOrder = orderRepository.findPendingByPassenger(passengerId);

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
    orderRepository.transaction(() => {
      // Проверяем статус водителя внутри транзакции, чтобы исключить TOCTOU:
      // водитель не должен успеть стать offline/busy между проверкой в контроллере и этим UPDATE.
      const driver = orderRepository.findDriverStatus(driverId);

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
      orderRepository.setDriverBusy(driverId);

      const acceptedOrder = orderRepository.findById(orderId);
      if (!acceptedOrder) {
        throw new Error('ORDER_NOT_AVAILABLE');
      }

      orderRepository.insertHistory(acceptedOrder, acceptedOrder.status);
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
      orderRepository.insertHistory(order, status);
    }

    return order;
  }
}

export const orderService = new OrderService();
