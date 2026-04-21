import { PassengerRepository } from './passenger.repository';
import type { Passenger } from '@prisma/client';

export class PassengerServiceError extends Error {
  constructor(
    public code: 'PASSENGER_NOT_FOUND' | 'INTERNAL_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'PassengerServiceError';
  }
}

export class PassengerService {
  private readonly repository: PassengerRepository;

  constructor() {
    this.repository = new PassengerRepository();
  }

  private isPrismaNotFoundError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2025';
  }

  async createPassenger(name: string, phone?: string): Promise<Passenger> {
    try {
      return await this.repository.create({
        name,
        phone,
      });
    } catch {
      throw new PassengerServiceError('INTERNAL_ERROR', 'Failed to create passenger');
    }
  }

  async getPassengerById(id: string): Promise<Passenger> {
    const passenger = await this.repository.findById(id);
    if (!passenger) {
      throw new PassengerServiceError('PASSENGER_NOT_FOUND', `Passenger ${id} not found`);
    }

    return passenger;
  }
}
