import type { CreateRideData, Ride, RideStatus, RideWithRelations } from './ride.types';

const ridesStorage: Ride[] = [];

export class RideRepository {
  async createRide(data: CreateRideData): Promise<RideWithRelations> {
    const now = new Date();

    const ride: Ride = {
      id: this.generateRideId(),
      userId: data.userId,
      driverId: data.driverId ?? null,
      from: data.from,
      to: data.to,
      status: data.status ?? 'PENDING',
      price: data.price,
      createdAt: now,
      updatedAt: now,
    };

    ridesStorage.unshift(ride);
    return ride;
  }

  async findRideById(id: string): Promise<RideWithRelations | null> {
    return ridesStorage.find((ride) => ride.id === id) ?? null;
  }

  async findAll(): Promise<RideWithRelations[]> {
    return [...ridesStorage];
  }

  async findByStatus(status: RideStatus): Promise<RideWithRelations[]> {
    return ridesStorage.filter((ride) => ride.status === status);
  }

  async updateRideStatus(id: string, status: RideStatus): Promise<RideWithRelations | null> {
    const ride = await this.findRideById(id);

    if (!ride) {
      return null;
    }

    ride.status = status;
    ride.updatedAt = new Date();
    return ride;
  }

  async assignDriver(rideId: string, driverId: string): Promise<RideWithRelations | null> {
    const ride = await this.findRideById(rideId);

    if (!ride) {
      return null;
    }

    ride.driverId = driverId;
    ride.updatedAt = new Date();
    return ride;
  }

  async create(data: CreateRideData): Promise<RideWithRelations> {
    return this.createRide(data);
  }

  async findById(id: string): Promise<RideWithRelations | null> {
    return this.findRideById(id);
  }

  async update(id: string, data: Partial<Pick<Ride, 'status' | 'driverId'>>): Promise<RideWithRelations | null> {
    const ride = await this.findRideById(id);

    if (!ride) {
      return null;
    }

    if (data.status) {
      ride.status = data.status;
    }

    if (typeof data.driverId !== 'undefined') {
      ride.driverId = data.driverId;
    }

    ride.updatedAt = new Date();
    return ride;
  }

  async passengerExists(passengerId: string): Promise<boolean> {
    return passengerId.trim().length > 0;
  }

  private generateRideId(): string {
    return `ride_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}