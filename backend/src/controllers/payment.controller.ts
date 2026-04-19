import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { paymentService } from '../services/payment.service';
import { orderService } from '../services/order.service';
import { driverService } from '../services/driver.service';
import { bonusService } from '../services/bonus.service';
import { isValidPaymentMethod } from '../utils/validators';

export class PaymentController {
  processPayment(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { orderId, method } = req.body as { orderId: string; method: string };

      if (!orderId || !method) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      if (!isValidPaymentMethod(method)) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_payment') });
        return;
      }

      const order = orderService.getOrderById(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }

      const amount = order.final_price ?? order.estimated_price;
      const validMethod = method as 'cash' | 'card';

      let payment = paymentService.getPaymentByOrderId(orderId);
      if (!payment) {
        payment = paymentService.createPayment(
          orderId,
          order.passenger_id,
          order.driver_id,
          amount,
          validMethod
        );
      }

      const processed = paymentService.processPayment(orderId);

      bonusService.awardCashback(order.passenger_id, orderId, amount);

      if (order.driver_id) {
        const driver = driverService.getDriverById(order.driver_id);
        if (driver) {
          driverService.setAvailable(order.driver_id);
        }
      }

      res.json({
        success: true,
        message: req.t?.('payment.success'),
        data: processed,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'PAYMENT_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('payment.not_found') });
        return;
      }
      if (error.message === 'PAYMENT_ALREADY_PROCESSED') {
        res.status(409).json({ success: false, message: req.t?.('payment.already_processed') });
        return;
      }
      next(err);
    }
  }

  getPayment(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { orderId } = req.params;
      const payment = paymentService.getPaymentByOrderId(orderId);
      if (!payment) {
        res.status(404).json({ success: false, message: req.t?.('payment.not_found') });
        return;
      }
      res.json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
