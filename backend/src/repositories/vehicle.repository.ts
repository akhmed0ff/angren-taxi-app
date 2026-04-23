import { BaseRepository } from '../db/base.repository';
import { v4 as uuidv4 } from 'uuid';
import { DbRow } from '../db/db.interface';

export interface VehicleRow extends DbRow {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  color: string;
  plate: string;
  year: number;
  category: 'economy' | 'comfort' | 'premium';
  is_active: number;
  created_at: number;
}

export interface VehicleData {
  make: string;
  model: string;
  color: string;
  plate: string;
  year: number;
  category: 'economy' | 'comfort' | 'premium';
}

export class VehicleRepository extends BaseRepository {
  findByDriverId(driverId: string): VehicleRow[] {
    return this.db.query<VehicleRow>(
      `SELECT * FROM vehicles WHERE driver_id = ? ORDER BY created_at DESC`,
      [driverId]
    );
  }

  findActiveByDriverId(driverId: string): VehicleRow | undefined {
    return this.db.queryOne<VehicleRow>(
      `SELECT * FROM vehicles WHERE driver_id = ? AND is_active = 1 LIMIT 1`,
      [driverId]
    );
  }

  findById(vehicleId: string): VehicleRow | undefined {
    return this.db.queryOne<VehicleRow>(
      `SELECT * FROM vehicles WHERE id = ?`,
      [vehicleId]
    );
  }

  create(driverId: string, data: VehicleData): VehicleRow {
    const vehicleId = uuidv4();
    this.db.execute(
      `INSERT INTO vehicles (id, driver_id, make, model, color, plate, year, category, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [vehicleId, driverId, data.make, data.model, data.color, data.plate, data.year, data.category]
    );

    return this.findById(vehicleId) as VehicleRow;
  }

  update(vehicleId: string, driverId: string, data: Partial<VehicleData>): VehicleRow {
    const vehicle = this.findById(vehicleId);
    if (!vehicle || vehicle.driver_id !== driverId) {
      throw new Error('VEHICLE_NOT_FOUND_OR_UNAUTHORIZED');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.make !== undefined) {
      updates.push('make = ?');
      values.push(data.make);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      values.push(data.model);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }
    if (data.plate !== undefined) {
      updates.push('plate = ?');
      values.push(data.plate);
    }
    if (data.year !== undefined) {
      updates.push('year = ?');
      values.push(data.year);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }

    if (updates.length === 0) {
      return vehicle;
    }

    values.push(vehicleId);
    this.db.execute(
      `UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(vehicleId) as VehicleRow;
  }

  setActive(vehicleId: string, driverId: string): void {
    const vehicle = this.findById(vehicleId);
    if (!vehicle || vehicle.driver_id !== driverId) {
      throw new Error('VEHICLE_NOT_FOUND_OR_UNAUTHORIZED');
    }

    // Deactivate all other vehicles for this driver
    this.db.execute(
      `UPDATE vehicles SET is_active = 0 WHERE driver_id = ?`,
      [driverId]
    );

    // Activate this vehicle
    this.db.execute(
      `UPDATE vehicles SET is_active = 1 WHERE id = ?`,
      [vehicleId]
    );
  }

  upsert(driverId: string, data: VehicleData): VehicleRow {
    // Try to find existing vehicle for this driver
    const existing = this.db.queryOne<VehicleRow>(
      `SELECT * FROM vehicles WHERE driver_id = ? LIMIT 1`,
      [driverId]
    );

    if (existing) {
      return this.update(existing.id, driverId, data);
    } else {
      return this.create(driverId, data);
    }
  }
}

export const vehicleRepository = new VehicleRepository();
