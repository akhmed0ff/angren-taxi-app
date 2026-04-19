import { Router, Request, Response } from 'express';
import { OrderService } from './order.service';
import { validateCoordinates, validateString } from '@/common/validators';

const router = Router();
const service = new OrderService();

interface CreateOrderRequest {
  fromLatitude?: any;
  fromLongitude?: any;
  toLatitude?: any;
  toLongitude?: any;
}

interface AssignOrderRequest {
}

interface UpdateStatusRequest {
  status?: any;
}

const VALID_STATUSES = ['searching', 'assigned', 'on_the_way', 'arrived', 'completed', 'cancelled'];

// POST /orders - Create order
router.post('/', async (req: Request<never, never, CreateOrderRequest>, res: Response) => {
  try {
    const { fromLatitude, fromLongitude, toLatitude, toLongitude, driverId } = req.body;

    // Validation
    const fromErrors = validateCoordinates(fromLatitude, fromLongitude);
    const toErrors = validateCoordinates(toLatitude, toLongitude);
    const allErrors = [...fromErrors, ...toErrors];

    if (allErrors.length > 0) {
      return res.status(400).json({ errors: allErrors });
    }

    const order = await service.createOrder({
      fromLatitude,
      fromLongitude,
      toLatitude,
      toLongitude,
      driverId,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /orders - Get all orders
router.get('/', async (_req: Request, res: Response) => {
  try {
    const orders = await service.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /orders/:id - Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await service.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /orders/status/:status - Get orders by status
router.get('/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid statuses: ${VALID_STATUSES.join(', ')}` });
    }

    const orders = await service.getOrdersByStatus(status);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /orders/driver/:driverId - Get orders by driver
router.get('/driver/:driverId', async (req: Request, res: Response) => {
  try {
    const orders = await service.getDriverOrders(req.params.driverId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver orders' });
  }
});

// PATCH /orders/:id/assign - Auto-assign nearest driver
router.patch('/:id/assign', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const order = await service.assignDriver(req.params.id);
    res.json(order);
  } catch (error: any) {
    const statusCode = error?.code === 'ORDER_NOT_FOUND' ? 404 : error?.code === 'NO_DRIVERS_AVAILABLE' ? 503 : 400;
    res.status(statusCode).json({ error: error?.message || 'Failed to assign driver' });
  }
});

// PATCH /orders/:id/status - Update order status
router.patch('/:id/status', async (req: Request<{ id: string }, never, UpdateStatusRequest>, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ errors: [{ field: 'status', message: 'status is required' }] });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid statuses: ${VALID_STATUSES.join(', ')}` });
    }

    const order = await service.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error: any) {
    const statusCode = error?.code === 'ORDER_NOT_FOUND' ? 404 : 400;
    res.status(statusCode).json({ error: error?.message || 'Failed to update order status' });
  }
});

// DELETE /orders/:id - Delete order

// PATCH /orders/:id/cancel - Cancel order
router.patch('/:id/cancel', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const order = await service.cancelOrder(req.params.id);
    res.json(order);
  } catch (error: any) {
    const statusCode = error?.code === 'ORDER_NOT_FOUND' ? 404 : 400;
    res.status(statusCode).json({ error: error?.message || 'Failed to cancel order' });
  }
});

// DELETE /orders/:id - Delete order (admin only)

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.deleteOrder(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (error: any) {
    const statusCode = error?.code === 'ORDER_NOT_FOUND' ? 404 : 500;
    res.status(statusCode).json({ error: error?.message || 'Failed to delete order' });
  }
});
export default router;
