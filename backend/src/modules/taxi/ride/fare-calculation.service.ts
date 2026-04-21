export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FareCalculationInput {
  pickup: Coordinates;
  destination: Coordinates;
  distanceKm?: number;
  durationMinutes?: number;
}

export interface FareCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  fare: number;
}

export class FareCalculationService {
  private static readonly EARTH_RADIUS_KM = 6371;

  // base tariff in so'm
  private static readonly BASE_FARE = 5000;
  // cost per 1 km in so'm
  private static readonly DISTANCE_RATE = 1500;
  // cost per 1 minute in so'm
  private static readonly TIME_RATE = 200;
  // default average speed for ETA estimation (city traffic)
  private static readonly AVG_SPEED_KMH = 28;

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  calculateDistanceKm(from: Coordinates, to: Coordinates): number {
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLng = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) *
        Math.cos(this.toRadians(to.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return FareCalculationService.EARTH_RADIUS_KM * c;
  }

  estimateDurationMinutes(distanceKm: number): number {
    if (distanceKm <= 0) {
      return 1;
    }

    const durationHours = distanceKm / FareCalculationService.AVG_SPEED_KMH;
    return Math.max(1, Math.ceil(durationHours * 60));
  }

  calculateFare(input: FareCalculationInput): FareCalculationResult {
    const rawDistance =
      typeof input.distanceKm === 'number' && input.distanceKm > 0
        ? input.distanceKm
        : this.calculateDistanceKm(input.pickup, input.destination);

    const distanceKm = Number(rawDistance.toFixed(2));

    const durationMinutes =
      typeof input.durationMinutes === 'number' && input.durationMinutes > 0
        ? Math.ceil(input.durationMinutes)
        : this.estimateDurationMinutes(distanceKm);

    const distanceCost = Math.ceil(distanceKm * FareCalculationService.DISTANCE_RATE);
    const timeCost = durationMinutes * FareCalculationService.TIME_RATE;
    const fare = FareCalculationService.BASE_FARE + distanceCost + timeCost;

    return {
      distanceKm,
      durationMinutes,
      fare,
    };
  }
}
