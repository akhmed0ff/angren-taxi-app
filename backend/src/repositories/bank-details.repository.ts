import { BaseRepository } from '../db/base.repository';
import { v4 as uuidv4 } from 'uuid';
import { DbRow } from '../db/db.interface';

export interface BankDetailsRow extends DbRow {
  id: string;
  driver_id: string;
  bank_name: string;
  account_number: string;
  created_at: number;
  updated_at: number;
}

export class BankDetailsRepository extends BaseRepository {
  upsert(driverId: string, bankName: string, accountNumber: string): void {
    const existing = this.findByDriverId(driverId);

    if (existing) {
      // Update existing
      this.db.execute(
        `UPDATE bank_details SET bank_name = ?, account_number = ?, updated_at = strftime('%s', 'now')
         WHERE driver_id = ?`,
        [bankName, accountNumber, driverId]
      );
    } else {
      // Create new
      this.db.execute(
        `INSERT INTO bank_details (id, driver_id, bank_name, account_number)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), driverId, bankName, accountNumber]
      );
    }
  }

  findByDriverId(driverId: string): BankDetailsRow | undefined {
    return this.db.queryOne<BankDetailsRow>(
      `SELECT * FROM bank_details WHERE driver_id = ?`,
      [driverId]
    );
  }
}

export const bankDetailsRepository = new BankDetailsRepository();
