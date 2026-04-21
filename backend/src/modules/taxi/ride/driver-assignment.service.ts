import { prisma } from '../../../core/db/prisma';
import { TaxiDriverService } from '../driver/driver.service';
import { DRIVER_STATUS, RIDE_STATUS } from '../types';
import type { RideWithRelations } from './ride.repository';
import type { Prisma } from '@prisma/client';

export class DriverAssignmentError extends Error {
  constructor(
    public code: 'RIDE_NOT_FOUND' | 'NO_DRIVER_AVAILABLE' | 'INVALID_RIDE_STATUS' | 'INTERNAL_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'DriverAssignmentError';
  }
}

export class DriverAssignmentService {
  private readonly driverService: TaxiDriverService;

  constructor() {
    this.driverService = new TaxiDriverService();
  }

  async assignNearestDriver(rideId: string): Promise<RideWithRelations> {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      throw new DriverAssignmentError('RIDE_NOT_FOUND', `Ride ${rideId} not found`);
    }

    if (ride.status !== RIDE_STATUS.REQUESTED) {
      throw new DriverAssignmentError(
        'INVALID_RIDE_STATUS',
        `Ride ${rideId} must be in REQUESTED status for assignment`,
      );
    }

    let nearestDriverId: string;
    try {
      const nearest = await this.driverService.findNearestDriver(ride.pickupLatitude, ride.pickupLongitude);
      nearestDriverId = nearest.id;
    } catch {
      throw new DriverAssignmentError('NO_DRIVER_AVAILABLE', 'No IDLE driver available for assignment');
    }

    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.driver.update({
          where: { id: nearestDriverId },
          data: {
            status: DRIVER_STATUS.BUSY,
            isAvailable: false,
          },
        });

        return tx.ride.update({
          where: { id: rideId },
          data: {
            driverId: nearestDriverId,
            status: RIDE_STATUS.ACCEPTED,
            acceptedAt: new Date(),
          },
          include: {
            passenger: true,
            driver: true,
          },
        });
      });
    } catch {
      throw new DriverAssignmentError('INTERNAL_ERROR', 'Failed to assign nearest driver');
    }
  }
}
