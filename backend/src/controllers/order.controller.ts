import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { orderService } from '../services/order.service';
import { driverService } from '../services/driver.service';
import { isValidCategory, isValidPaymentMethod } from '../utils/validators';
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
      res.json({ success: true, data: order });
    } catch (err) {
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

      const order = orderService.acceptOrder(orderId, driver.id, vehicleId);
      driverService.setBusy(driver.id);

      res.json({
        success: true,
        message: req.t?.('order.accepted'),
        data: order,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ORDER_NOT_AVAILABLE') {
        res.status(409).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }
      next(err);
    }
  }
}

export const orderController = new OrderController();
