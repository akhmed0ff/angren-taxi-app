import { Driver } from '../models/driver.model';
import { Order } from '../models/order.model';
import { haversineDistance } from '../utils/distance';

const MATCH_RADIUS_KM = 10;export class MatchingService {
  /**
   * Find nearby online drivers sorted by distance to the pickup point.
   * Returns up to `limit` drivers within MATCH_RADIUS_KM.
   */
  findNearbyDrivers(order: Order, drivers: Driver[], limit = 5): Driver[] {
    if (!order.from_latitude || !order.from_longitude) return [];

    return drivers
      .filter((d) => d.latitude !== null && d.longitude !== null && d.status === 'online')
      .map((d) => ({
        driver: d,
        distance: haversineDistance(
          order.from_latitude,
          order.from_longitude,
          d.latitude as number,
          d.longitude as number
        ),
      }))
      .filter(({ distance }) => distance <= MATCH_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(({ driver }) => driver);
  }

  /**
   * Auto-assign the closest available driver to an order.
   * Returns the matched driver or null if none available.
   */
  autoMatch(order: Order, drivers: Driver[]): Driver | null {
    const nearby = this.findNearbyDrivers(order, drivers, 1);
    return nearby[0] ?? null;
  }
}

export const matchingService = new MatchingService();
