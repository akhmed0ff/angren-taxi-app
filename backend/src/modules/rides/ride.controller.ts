import { type Request, type Response, type NextFunction } from 'express';
import type { Server } from 'socket.io';
import { RideService, RideServiceError } from './ride.service';
import { RIDE_STATUSES, type RideLocationPoint, type RideStatus } from './ride.types';

const VALID_RIDE_STATUSES = Object.values(RIDE_STATUSES);

function isValidLocation(value: unknown): value is RideLocationPoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as RideLocationPoint).lat === 'number' &&
    Number.isFinite((value as RideLocationPoint).lat) &&
    typeof (value as RideLocationPoint).lng === 'number' &&
    Number.isFinite((value as RideLocationPoint).lng)
  );
}

function handleError(error: unknown, res: Response, fallback: string): void {
  if (error instanceof RideServiceError) {
    const statusCode =
      error.code === 'RIDE_NOT_FOUND' || error.code === 'PASSENGER_NOT_FOUND' ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: fallback });
}

export class RideController {
  private readonly rideService: RideService;

  constructor(io: Server | null = null) {
    this.rideService = new RideService(io);
  }

  /** Late-inject the Socket.IO instance (forwarded to RideService). */
  setIo(io: Server): void {
    this.rideService.setIo(io);
  }

  async createRide(
    req: Request<Record<string, never>, never, { userId?: string; from?: unknown; to?: unknown }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    const { userId, from, to } = req.body;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    if (!isValidLocation(from)) {
      res.status(400).json({ error: 'from must be an object with numeric lat and lng fields' });
      return;
    }
    if (!isValidLocation(to)) {
      res.status(400).json({ error: 'to must be an object with numeric lat and lng fields' });
      return;
    }

    try {
      const ride = await this.rideService.createRide(userId, from, to);
      res.status(201).json(ride);
    } catch (error) {
      handleError(error, res, 'Failed to create ride');
    }
  }

  async acceptRide(
    req: Request<{ id: string }, never, { driverId?: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    const { driverId } = req.body;

    if (!driverId || typeof driverId !== 'string') {
      res.status(400).json({ error: 'driverId is required' });
      return;
    }

    try {
      const ride = await this.rideService.acceptRide(req.params.id, driverId);
      res.json(ride);
    } catch (error) {
      handleError(error, res, 'Failed to accept ride');
    }
  }

  async startRide(
    req: Request<{ id: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const ride = await this.rideService.startRide(req.params.id);
      res.json(ride);
    } catch (error) {
      handleError(error, res, 'Failed to start ride');
    }
  }

  async completeRide(
    req: Request<{ id: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const ride = await this.rideService.completeRide(req.params.id);
      res.json(ride);
    } catch (error) {
      handleError(error, res, 'Failed to complete ride');
    }
  }

  async cancelRide(
    req: Request<{ id: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const ride = await this.rideService.cancelRide(req.params.id);
      res.json(ride);
    } catch (error) {
      handleError(error, res, 'Failed to cancel ride');
    }
  }

  async getAllRides(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const rides = await this.rideService.getAllRides();
      res.json(rides);
    } catch {
      res.status(500).json({ error: 'Failed to fetch rides' });
    }
  }

  async getRidesByStatus(
    req: Request<{ status: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    const { status } = req.params;

    if (!VALID_RIDE_STATUSES.includes(status as RideStatus)) {
      res.status(400).json({
        error: `Invalid status. Valid statuses: ${VALID_RIDE_STATUSES.join(', ')}`,
      });
      return;
    }

    try {
      const rides = await this.rideService.getRidesByStatus(status as RideStatus);
      res.json(rides);
    } catch {
      res.status(500).json({ error: 'Failed to fetch rides by status' });
    }
  }

  async getRideById(
    req: Request<{ id: string }>,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const ride = await this.rideService.getRideById(req.params.id);
      res.json(ride);
    } catch (error) {
      handleError(error, res, 'Failed to fetch ride');
    }
  }
}

export const rideController = new RideController();