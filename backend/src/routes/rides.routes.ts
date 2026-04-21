import { Router } from 'express';
import { rideController } from '../modules/rides/ride.controller';

const router = Router();

// POST /api/rides — create a new ride
router.post('/', (req, res, next) => rideController.createRide(req, res, next));

// POST /api/rides/:id/accept — driver accepts the ride
router.post('/:id/accept', (req, res, next) => rideController.acceptRide(req, res, next));

// POST /api/rides/:id/start — start the ride
router.post('/:id/start', (req, res, next) => rideController.startRide(req, res, next));

// POST /api/rides/:id/complete — complete the ride
router.post('/:id/complete', (req, res, next) => rideController.completeRide(req, res, next));

// POST /api/rides/:id/cancel — cancel the ride
router.post('/:id/cancel', (req, res, next) => rideController.cancelRide(req, res, next));

// GET /api/rides — list all rides
router.get('/', (req, res, next) => rideController.getAllRides(req, res, next));

// GET /api/rides/status/:status — filter rides by status
router.get('/status/:status', (req, res, next) => rideController.getRidesByStatus(req, res, next));

// GET /api/rides/:id — get single ride by id
router.get('/:id', (req, res, next) => rideController.getRideById(req, res, next));

export default router;
export { rideController };
