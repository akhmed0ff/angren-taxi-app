import { env } from '../../../config/env';

export type RoutingProvider = 'osrm' | 'google';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RoutePlanningResult {
  provider: RoutingProvider;
  distanceKm: number;
  durationMinutes: number;
  path: Coordinates[];
}

interface GoogleDirectionsResponse {
  routes?: Array<{
    overview_polyline?: { points?: string };
    legs?: Array<{ distance?: { value?: number }; duration?: { value?: number } }>;
  }>;
  status?: string;
  error_message?: string;
}

interface OsrmResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates?: number[][];
    };
  }>;
}

export class RoutePlanningError extends Error {
  constructor(
    public code: 'ROUTE_NOT_FOUND' | 'ROUTING_CONFIG_ERROR' | 'ROUTING_PROVIDER_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'RoutePlanningError';
  }
}

export class RoutePlanningService {
  private static readonly DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org';

  private resolveProvider(preferred?: RoutingProvider): RoutingProvider {
    if (preferred) {
      return preferred;
    }

    const fromEnv = (env.routingProvider ?? 'osrm').toLowerCase();
    return fromEnv === 'google' ? 'google' : 'osrm';
  }

  private decodeGooglePolyline(encoded: string): Coordinates[] {
    const points: Coordinates[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b: number;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dLat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dLng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  private async getRouteFromOsrm(from: Coordinates, to: Coordinates): Promise<RoutePlanningResult> {
    const osrmBaseUrl = env.osrmBaseUrl || RoutePlanningService.DEFAULT_OSRM_BASE_URL;
    const url = `${osrmBaseUrl}/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new RoutePlanningError('ROUTING_PROVIDER_ERROR', 'OSRM request failed');
    }

    const body = (await response.json()) as OsrmResponse;

    if (body.code !== 'Ok' || !body.routes?.length) {
      throw new RoutePlanningError('ROUTE_NOT_FOUND', 'Route not found in OSRM');
    }

    const route = body.routes[0];
    const path = (route.geometry?.coordinates ?? []).map(([lon, lat]) => ({
      latitude: lat,
      longitude: lon,
    }));

    return {
      provider: 'osrm',
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      durationMinutes: Math.max(1, Math.ceil(route.duration / 60)),
      path,
    };
  }

  private async getRouteFromGoogle(from: Coordinates, to: Coordinates): Promise<RoutePlanningResult> {
    if (!env.googleDirectionsApiKey) {
      throw new RoutePlanningError('ROUTING_CONFIG_ERROR', 'GOOGLE_DIRECTIONS_API_KEY is not configured');
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&mode=driving&key=${env.googleDirectionsApiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new RoutePlanningError('ROUTING_PROVIDER_ERROR', 'Google Directions request failed');
    }

    const body = (await response.json()) as GoogleDirectionsResponse;

    if (body.status !== 'OK' || !body.routes?.length) {
      throw new RoutePlanningError(
        'ROUTE_NOT_FOUND',
        body.error_message || `Google route not found. Status: ${body.status ?? 'unknown'}`,
      );
    }

    const route = body.routes[0];
    const legs = route.legs ?? [];

    const distanceMeters = legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0);
    const durationSeconds = legs.reduce((sum, leg) => sum + (leg.duration?.value ?? 0), 0);

    const encodedPolyline = route.overview_polyline?.points;
    const path = encodedPolyline ? this.decodeGooglePolyline(encodedPolyline) : [];

    return {
      provider: 'google',
      distanceKm: Number((distanceMeters / 1000).toFixed(2)),
      durationMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
      path,
    };
  }

  async getRoute(from: Coordinates, to: Coordinates, preferredProvider?: RoutingProvider): Promise<RoutePlanningResult> {
    const provider = this.resolveProvider(preferredProvider);

    if (provider === 'google') {
      return this.getRouteFromGoogle(from, to);
    }

    return this.getRouteFromOsrm(from, to);
  }
}
