import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { orderService } from '../services/order.service';
import { driverService } from '../services/driver.service';
import { vehicleRepository } from '../repositories/vehicle.repository';
import { isValidCategory, isValidPaymentMethod, isValidLatitude, isValidLongitude } from '../utils/validators';
import { CreateOrderInput } from '../models/order.model';

export class OrderController {
  createOrder(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const {
        category,
        from_address,
        from_latitude,
        from_longitude,
        to_address,
        to_latitude,
        to_longitude,
        payment_method,
        note,
      } = req.body as CreateOrderInput;

      if (!category || !from_address || !to_address || !payment_method) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      if (!isValidCategory(category)) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_category') });
        return;
      }

      if (!isValidPaymentMethod(payment_method)) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_payment') });
        return;
      }

      if (
        !isValidLatitude(from_latitude) ||
        !isValidLongitude(from_longitude) ||
        !isValidLatitude(to_latitude) ||
        !isValidLongitude(to_longitude)
      ) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_coordinates') });
        return;
      }

      const order = orderService.createOrder(req.user!.userId, {
        category,
        from_address,
        from_latitude,
        from_longitude,
        to_address,
        to_latitude,
        to_longitude,
        payment_method,
        note,
      });

      res.status(201).json({
        success: true,
        message: req.t?.('order.created'),
        data: order,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ALREADY_ACTIVE_ORDER') {
        res.status(409).json({ success: false, message: req.t?.('order.already_active') });
        return;
      }
      next(err);
    }
  }

  getOrder(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;
      const order = orderService.getOrderById(id);
      if (!order) {
        res.status(404).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }

      const { userId, type } = req.user!;

      // Учётная запись admin видит всё без проверок
      if (type !== 'admin') {
        // Для водителя нужен его drivers.id (не userId) для сравнения с order.driver_id
        let driverRecordId: string | null = null;
        if (type === 'driver') {
          const driver = driverService.getDriver(userId);
          if (!driver) {
            res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
            return;
          }
          driverRecordId = driver.id;
        }

        orderService.assertCanViewOrder(order, userId, type, driverRecordId);
      }

      res.json({ success: true, data: order });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ORDER_ACCESS_DENIED') {
        res.status(403).json({ success: false, message: req.t?.('errors.forbidden') });
        return;
      }
      next(err);
    }
  }

  getAvailableOrders(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const category = req.query['category'] as string | undefined;
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const orders = orderService.getAvailableOrders(category);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  acceptOrder(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { orderId, vehicleId } = req.body as { orderId: string; vehicleId: string };
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      // Validate that driver has an active vehicle
      const vehicle = vehicleRepository.findActiveByDriverId(driver.id);
      if (!vehicle) {
        res.status(400).json({
          success: false,
          message: req.t?.('vehicle.required_for_orders') || 'Добавьте данные автомобиля перед принятием заказов',
        });
        return;
      }

      const order = orderService.acceptOrder(orderId, driver.id, vehicleId);

      res.json({
        success: true,
        message: req.t?.('order.accepted'),
        data: order,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ORDER_NOT_AVAILABLE') {
        res.status(409).json({ success: false, message: req.t?.('order.not_available') ?? 'Order is no longer available' });
        return;
      }
      if (error.message === 'DRIVER_NOT_AVAILABLE') {
        res.status(409).json({ success: false, message: req.t?.('driver.not_available') });
        return;
      }
      if (error.message === 'DRIVER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }
      next(err);
    }
  }

  rejectOrder(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { id: orderId } = req.params;
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const order = orderService.rejectOrder(orderId, driver.id);
      res.json({
        success: true,
        message: 'Order rejected',
        data: order,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ORDER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }
      if (error.message === 'ORDER_ACCESS_DENIED') {
        res.status(403).json({ success: false, message: req.t?.('errors.forbidden') });
        return;
      }
      if (error.message === 'INVALID_STATUS_TRANSITION') {
        res.status(409).json({ success: false, message: 'Invalid status transition' });
        return;
      }
      next(err);
    }
  }

  arrivedAtPickup(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { id: orderId } = req.params;
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const order = orderService.arriveAtPickup(orderId, driver.id);
      res.json({
        success: true,
        message: 'Arrived at pickup',
        data: order,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ORDER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }
      if (error.message === 'ORDER_ACCESS_DENIED') {
        res.status(403).json({ success: false, message: req.t?.('errors.forbidden') });
        return;
      }
      if (error.message === 'INVALID_STATUS_TRANSITION') {
        res.status(409).json({ success: false, message: 'Invalid status transition' });
        return;
      }
      next(err);
    }
  }

  startOrder(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { id: orderId } = req.params;
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const order = orderService.startOrder(orderId, driver.id);
      res.json({
        success: true,
        message: 'Order started',
        data: order,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ORDER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }
      if (error.message === 'ORDER_ACCESS_DENIED') {
        res.status(403).json({ success: false, message: req.t?.('errors.forbidden') });
        return;
      }
      if (error.message === 'INVALID_STATUS_TRANSITION') {
        res.status(409).json({ success: false, message: 'Invalid status transition' });
        return;
      }
      next(err);
    }
  }

  completeOrder(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { id: orderId } = req.params;
      const { finalPrice } = req.body as { finalPrice?: number };
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const order = orderService.completeOrder(orderId, driver.id, finalPrice);
      res.json({
        success: true,
        message: 'Order completed',
        data: order,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ORDER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }
      if (error.message === 'ORDER_ACCESS_DENIED') {
        res.status(403).json({ success: false, message: req.t?.('errors.forbidden') });
        return;
      }
      if (error.message === 'INVALID_STATUS_TRANSITION') {
        res.status(409).json({ success: false, message: 'Invalid status transition' });
        return;
      }
      next(err);
    }
  }

  getActiveOrder(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const order = orderService.getActiveOrder(req.user!.userId);
      if (!order) {
        res.json({ success: true, data: null });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  getOrderHistory(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { userId, type } = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      let result: { orders: Order[]; total: number };

      if (type === 'driver') {
        const driver = driverService.getDriver(userId);
        if (!driver) {
          res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
          return;
        }
        result = orderService.getOrderHistory(userId, { page, limit, status });
      } else {
        // passenger (and admin can also see passenger orders)
        result = orderService.getPassengerOrderHistory(userId, { page, limit });
      }

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          page,
          limit,
          total: result.total,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
