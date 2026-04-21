import { prisma } from '../../../core/db/prisma';
import { RideRepository } from './ride.repository';
import type { RideWithRelations } from './ride.repository';
import { PassengerService } from '../passenger/passenger.service';
import { DriverAssignmentService } from './driver-assignment.service';
import { TaxiDriverService } from '../driver/driver.service';
import { DRIVER_STATUS, RIDE_STATUS, type RideStatus } from '../types';
import { Prisma } from '@prisma/client';
import { FareCalculationService } from './fare-calculation.service';
import { RoutePlanningService } from './route-planning.service';

const VALID_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  [RIDE_STATUS.REQUESTED]: [RIDE_STATUS.ACCEPTED, RIDE_STATUS.CANCELLED],
  [RIDE_STATUS.ACCEPTED]: [RIDE_STATUS.ON_TRIP, RIDE_STATUS.CANCELLED],
  [RIDE_STATUS.ON_TRIP]: [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED],
  [RIDE_STATUS.COMPLETED]: [],
  [RIDE_STATUS.CANCELLED]: [],
};

export interface CreateRideDTO {
  passengerId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

export class RideServiceError extends Error {
  constructor(
    public code:
      | 'RIDE_NOT_FOUND'
      | 'INVALID_STATUS_TRANSITION'
      | 'INVALID_STATUS'
      | 'PASSENGER_NOT_FOUND'
      | 'INTERNAL_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'RideServiceError';
  }
}

export class RideService {
  private readonly repository: RideRepository;
  private readonly passengerService: PassengerService;
  private readonly assignmentService: DriverAssignmentService;
  private readonly driverService: TaxiDriverService;
  private readonly fareService: FareCalculationService;
  private readonly routePlanningService: RoutePlanningService;

  constructor() {
    this.repository = new RideRepository();
    this.passengerService = new PassengerService();
    this.assignmentService = new DriverAssignmentService();
    this.driverService = new TaxiDriverService();
    this.fareService = new FareCalculationService();
    this.routePlanningService = new RoutePlanningService();
  }

  private validateTransition(currentStatus: RideStatus, nextStatus: RideStatus): void {
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed.includes(nextStatus)) {
      throw new RideServiceError(
        'INVALID_STATUS_TRANSITION',
        `Transition ${currentStatus} -> ${nextStatus} is not allowed`,
      );
    }
  }

  private isPrismaNotFoundError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2025';
  }

  async createRide(data: CreateRideDTO): Promise<RideWithRelations> {
    try {
      await this.passengerService.getPassengerById(data.passengerId);
    } catch {
      throw new RideServiceError('PASSENGER_NOT_FOUND', `Passenger ${data.passengerId} not found`);
    }

    const pickup = {
      latitude: data.pickupLatitude,
      longitude: data.pickupLongitude,
    };

    const destination = {
      latitude: data.destinationLatitude,
      longitude: data.destinationLongitude,
    };

    let routedDistanceKm: number | undefined;
    let routedDurationMinutes: number | undefined;

    try {
      const route = await this.routePlanningService.getRoute(pickup, destination);
      routedDistanceKm = route.distanceKm;
      routedDurationMinutes = route.durationMinutes;
    } catch {
      // Fallback to haversine/estimated duration when routing provider is unavailable.
    }

    const fareResult = this.fareService.calculateFare({
      pickup,
      destination,
      distanceKm: routedDistanceKm,
      durationMinutes: routedDurationMinutes,
    });

    try {
      return await this.repository.create({
        passenger: { connect: { id: data.passengerId } },
        pickupLatitude: data.pickupLatitude,
        pickupLongitude: data.pickupLongitude,
        destinationLatitude: data.destinationLatitude,
        destinationLongitude: data.destinationLongitude,
        distanceKm: fareResult.distanceKm,
        fare: fareResult.fare,
        status: RIDE_STATUS.REQUESTED,
      });
    } catch {
      throw new RideServiceError('INTERNAL_ERROR', 'Failed to create ride');
    }
  }

  async assignDriver(rideId: string): Promise<RideWithRelations> {
    try {
      return await this.assignmentService.assignNearestDriver(rideId);
    } catch (error: any) {
      if (error?.code === 'RIDE_NOT_FOUND') {
        throw new RideServiceError('RIDE_NOT_FOUND', error.message);
      }

      if (error?.code === 'INVALID_RIDE_STATUS') {
        throw new RideServiceError('INVALID_STATUS', error.message);
      }

      throw new RideServiceError('INTERNAL_ERROR', error?.message ?? 'Failed to assign driver');
    }
  }

  async updateStatus(rideId: string, nextStatus: RideStatus): Promise<RideWithRelations> {
    if (!Object.values(RIDE_STATUS).includes(nextStatus)) {
      throw new RideServiceError('INVALID_STATUS', `Unknown ride status: ${nextStatus}`);
    }

    const ride = await this.repository.findById(rideId);
    if (!ride) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    this.validateTransition(ride.status as RideStatus, nextStatus);

    const patch: any = { status: nextStatus };

    if (nextStatus === RIDE_STATUS.ON_TRIP) {
      patch.startedAt = new Date();
    }

    if (nextStatus === RIDE_STATUS.COMPLETED) {
      patch.completedAt = new Date();
    }

    if (nextStatus === RIDE_STATUS.CANCELLED) {
      patch.cancelledAt = new Date();
    }

    try {
      if (
        (nextStatus === RIDE_STATUS.COMPLETED || nextStatus === RIDE_STATUS.CANCELLED)
        && ride.driverId
      ) {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          await tx.driver.update({
            where: { id: ride.driverId! },
            data: {
              status: DRIVER_STATUS.IDLE,
              isAvailable: true,
            },
          });

          await tx.ride.update({
            where: { id: rideId },
            data: patch,
          });
        });

        const updated = await this.repository.findById(rideId);
        if (!updated) {
          throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found after update`);
        }

        return updated;
      }

      return await this.repository.update(rideId, patch);
    } catch (error) {
      if (this.isPrismaNotFoundError(error)) {
        throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
      }

      if (error instanceof RideServiceError) {
        throw error;
      }

      throw new RideServiceError('INTERNAL_ERROR', 'Failed to update ride status');
    }
  }

  async getRideById(rideId: string): Promise<RideWithRelations> {
    const ride = await this.repository.findById(rideId);
    if (!ride) {
      throw new RideServiceError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    return ride;
  }
}
