import type { Server } from 'socket.io';
import { DriverService } from '../driver/driver.service';
import { RideRepository } from './ride.repository';
import {
  RIDE_STATUSES,
  type Coordinates,
  type CreateRideData,
  type CreateRideDto,
  type RideLocationPoint,
  type RideStatus,
  type RideWithRelations,
} from './ride.types';

const EARTH_RADIUS_KM = 6371;
const BASE_FARE = 5000;
const RATE_PER_KM = 2000;
const SURGE_MULTIPLIER = 1.5;

export class RideServiceError extends Error {
  constructor(
    public code:
      | 'RIDE_NOT_FOUND'
      | 'PASSENGER_NOT_FOUND'
      | 'INVALID_STATUS'
      | 'INVALID_STATUS_TRANSITION'
      | 'INTERNAL_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'RideServiceError';
  }
}

export class RideService {
  private readonly rideRepository: RideRepository;
  private readonly driverService: DriverService;
  private io: Server | null;

  constructor(io: Server | null = null) {
    this.rideRepository = new RideRepository();
    this.driverService = new DriverService();
    this.io = io;
  }

  /** Late-inject the Socket.IO instance (called from server.ts after initializeSocket). */
  setIo(io: Server): void {
    this.io = io;
  }

  // ---------------------------------------------------------------------------
  // Private socket emitters — no-op if socket not yet injected
  // ---------------------------------------------------------------------------

  private emitRideCreated(ride: RideWithRelations): void {
    this.io?.to(`passenger:${ride.userId}`).emit('ride:created', { ride });
  }

  private emitRideAccepted(rideId: string, driverId: string): void {
    this.io?.to(`ride:${rideId}`).emit('ride:accepted', { rideId, driverId });
    this.io?.to(`driver:${driverId}`).emit('ride:accepted', { rideId, driverId });
  }

  private emitRideStarted(rideId: string): void {
    this.io?.to(`ride:${rideId}`).emit('ride:started', { rideId });
  }

  private emitRideCompleted(rideId: string, price: number): void {
    this.io?.to(`ride:${rideId}`).emit('ride:completed', { rideId, price });
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  private calculateDistance(from: Coordinates, to: Coordinates): number {
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLng = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) *
        Math.cos(this.toRadians(to.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((EARTH_RADIUS_KM * c).toFixed(2));
  }

  private calculateFare(distanceKm: number): number {
    return BASE_FARE + (distanceKm * RATE_PER_KM);
  }

  private async applySurgeIfNeeded(basePrice: number): Promise<number> {
    const [availableDrivers, pendingRequests] = await Promise.all([
      this.driverService.getAvailableDrivers(),
      this.rideRepository.findByStatus(RIDE_STATUSES.PENDING),
    ]);

    const activeRequestsCount = pendingRequests.length + 1;

    if (availableDrivers.length < activeRequestsCount) {
      return basePrice * SURGE_MULTIPLIER;
    }

    return basePrice;
  }

  private async requireRide(rideId: string): Promise<RideWithRelations> {
    const ride = await this.rideRepository.findRideById(rideId);

    if (!ride) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    return ride;
  }

  private ensureStatus(ride: RideWithRelations, expectedStatus: RideStatus, action: string): void {
    if (ride.status !== expectedStatus) {
      throw new RideServiceError(
        'INVALID_STATUS_TRANSITION',
        `Only ${expectedStatus} ride can be ${action}. Current status: ${ride.status}`,
      );
    }
  }

  private ensureCanCancel(ride: RideWithRelations): void {
    if (ride.status === RIDE_STATUSES.COMPLETED || ride.status === RIDE_STATUSES.CANCELLED) {
      throw new RideServiceError(
        'INVALID_STATUS_TRANSITION',
        `Ride in status ${ride.status} cannot be cancelled`,
      );
    }
  }

  async createRide(userId: string, from: RideLocationPoint, to: RideLocationPoint): Promise<RideWithRelations> {
    const passengerExists = await this.rideRepository.passengerExists(userId);

    if (!passengerExists) {
      throw new RideServiceError('PASSENGER_NOT_FOUND', `Passenger ${userId} not found`);
    }

    const distanceKm = this.calculateDistance(
      {
        latitude: from.lat,
        longitude: from.lng,
      },
      {
        latitude: to.lat,
        longitude: to.lng,
      },
    );

    const baseFare = this.calculateFare(distanceKm);
    const fare = await this.applySurgeIfNeeded(baseFare);

    try {
      const rideData: CreateRideData = {
        userId,
        driverId: null,
        from,
        to,
        price: fare,
        status: RIDE_STATUSES.PENDING,
      };

      const ride = await this.rideRepository.createRide(rideData);
      this.emitRideCreated(ride);

      const nearestDriver = await this.driverService.findNearestDriver(from.lat, from.lng);
      const assignedRide = await this.rideRepository.assignDriver(ride.id, nearestDriver.id);

      if (!assignedRide) {
        throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${ride.id} not found`);
      }

      const acceptedRide = await this.rideRepository.updateRideStatus(ride.id, RIDE_STATUSES.ACCEPTED);

      if (!acceptedRide) {
        throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${ride.id} not found`);
      }

      this.emitRideAccepted(acceptedRide.id, nearestDriver.id);
      return acceptedRide;
    } catch {
      throw new RideServiceError('INTERNAL_ERROR', 'Failed to create ride');
    }
  }

  async acceptRide(rideId: string, driverId: string): Promise<RideWithRelations> {
    const ride = await this.requireRide(rideId);
    this.ensureStatus(ride, RIDE_STATUSES.PENDING, 'accepted');

    const assignedRide = await this.rideRepository.assignDriver(rideId, driverId);

    if (!assignedRide) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    const updatedRide = await this.rideRepository.updateRideStatus(rideId, RIDE_STATUSES.ACCEPTED);

    if (!updatedRide) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    this.emitRideAccepted(rideId, driverId);
    return updatedRide;
  }

  async startRide(rideId: string): Promise<RideWithRelations> {
    const ride = await this.requireRide(rideId);
    this.ensureStatus(ride, RIDE_STATUSES.ACCEPTED, 'started');

    const updatedRide = await this.rideRepository.updateRideStatus(rideId, RIDE_STATUSES.IN_PROGRESS);

    if (!updatedRide) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    this.emitRideStarted(rideId);
    return updatedRide;
  }

  async completeRide(rideId: string): Promise<RideWithRelations> {
    const ride = await this.requireRide(rideId);
    this.ensureStatus(ride, RIDE_STATUSES.IN_PROGRESS, 'completed');

    const updatedRide = await this.rideRepository.updateRideStatus(rideId, RIDE_STATUSES.COMPLETED);

    if (!updatedRide) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    this.emitRideCompleted(rideId, updatedRide.price);
    return updatedRide;
  }

  async cancelRide(rideId: string): Promise<RideWithRelations> {
    const ride = await this.requireRide(rideId);
    this.ensureCanCancel(ride);

    const updatedRide = await this.rideRepository.updateRideStatus(rideId, RIDE_STATUSES.CANCELLED);

    if (!updatedRide) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    return updatedRide;
  }

  async createRideFromDto(dto: CreateRideDto): Promise<RideWithRelations> {
    return this.createRide(
      dto.passengerId,
      {
        lat: dto.pickupLatitude,
        lng: dto.pickupLongitude,
      },
      {
        lat: dto.destinationLatitude,
        lng: dto.destinationLongitude,
      },
    );
  }

  async getRideById(rideId: string): Promise<RideWithRelations> {
    return this.requireRide(rideId);
  }

  async getAllRides(): Promise<RideWithRelations[]> {
    return this.rideRepository.findAll();
  }

  async getRidesByStatus(status: RideStatus): Promise<RideWithRelations[]> {
    return this.rideRepository.findByStatus(status);
  }

  async updateRideStatus(rideId: string, nextStatus: RideStatus): Promise<RideWithRelations> {
    switch (nextStatus) {
      case RIDE_STATUSES.ACCEPTED:
        throw new RideServiceError('INVALID_STATUS', 'Use acceptRide(rideId, driverId) to accept a ride');
      case RIDE_STATUSES.IN_PROGRESS:
        return this.startRide(rideId);
      case RIDE_STATUSES.COMPLETED:
        return this.completeRide(rideId);
      case RIDE_STATUSES.CANCELLED:
        return this.cancelRide(rideId);
      case RIDE_STATUSES.PENDING:
      case RIDE_STATUSES.ARRIVED:
      default:
        throw new RideServiceError('INVALID_STATUS', `Unsupported manual status update: ${nextStatus}`);
    }
  }
}