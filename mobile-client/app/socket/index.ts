import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useRideStore } from '../store/useRideStore';
import type { Ride } from '../api/client';

// ---------------------------------------------------------------------------
// Event payload types (mirror backend realtime/socket.ts)
// ---------------------------------------------------------------------------

interface RideAcceptedPayload {
  rideId: string;
  driverId: string;
}

interface RideStartedPayload {
  rideId: string;
}

interface RideCompletedPayload {
  rideId: string;
  price: number;
}

interface RideCreatedPayload {
  ride: Ride;
}

interface DriverLocationPayload {
  driverId: string;
  latitude: number;
  longitude: number;
  rideId?: string;
}

// ---------------------------------------------------------------------------
// Singleton socket instance
// ---------------------------------------------------------------------------

let socket: Socket | null = null;

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

/**
 * Creates and connects the Socket.IO client.
 * Safe to call multiple times — returns the existing socket if already open.
 *
 * @param token  Optional JWT passed in the auth handshake header.
 */
export function connectSocket(token?: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    if (__DEV__) console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    if (__DEV__) console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    if (__DEV__) console.error('[Socket] Connection error:', err.message);
  });

  registerRideEvents(socket);

  return socket;
}

/**
 * Disconnects and removes the socket instance.
 */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

/**
 * Returns the current socket instance (or null if not connected).
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Subscribe to a ride room so the server sends events for that ride.
 */
export function subscribeToRide(rideId: string): void {
  socket?.emit('ride:subscribe', rideId);
}

/**
 * Unsubscribe from a ride room.
 */
export function unsubscribeFromRide(rideId: string): void {
  socket?.emit('ride:unsubscribe', rideId);
}

// ---------------------------------------------------------------------------
// Ride event handlers — update useRideStore on each event
// ---------------------------------------------------------------------------

function registerRideEvents(s: Socket): void {
  // ride:created — passenger receives their newly created ride
  s.on('ride:created', (payload: RideCreatedPayload) => {
    if (__DEV__) console.log('[Socket] ride:created', payload.ride.id);
    subscribeToRide(payload.ride.id);
    useRideStore.setState({ ride: payload.ride, status: payload.ride.status });
  });

  // ride:accepted — driver accepted, store updated with new status + driverId
  s.on('ride:accepted', (payload: RideAcceptedPayload) => {
    if (__DEV__) console.log('[Socket] ride:accepted', payload);
    subscribeToRide(payload.rideId);
    useRideStore.setState((state) => {
      const ride = state.ride as { id?: string } | null;
      if (!ride || ride.id !== payload.rideId) return {};
      return {
        ride: { ...(state.ride as object), status: 'ACCEPTED', driverId: payload.driverId },
        status: 'ACCEPTED',
      };
    });
  });

  // ride:started — driver picked up the passenger
  s.on('ride:started', (payload: RideStartedPayload) => {
    if (__DEV__) console.log('[Socket] ride:started', payload);
    useRideStore.setState((state) => {
      const ride = state.ride as { id?: string } | null;
      if (!ride || ride.id !== payload.rideId) return {};
      return {
        ride: { ...(state.ride as object), status: 'IN_PROGRESS' },
        status: 'IN_PROGRESS',
      };
    });
  });

  // ride:completed — ride is over, price confirmed
  s.on('ride:completed', (payload: RideCompletedPayload) => {
    if (__DEV__) console.log('[Socket] ride:completed', payload);
    useRideStore.setState((state) => {
      const ride = state.ride as { id?: string } | null;
      if (!ride || ride.id !== payload.rideId) return {};
      return {
        ride: { ...(state.ride as object), status: 'COMPLETED', price: payload.price },
        status: 'COMPLETED',
      };
    });
  });

  // driver:location — real-time driver position update
  s.on('driver:location', (payload: DriverLocationPayload) => {
    if (
      typeof payload.latitude !== 'number' ||
      typeof payload.longitude !== 'number'
    ) return;

    useRideStore.getState().setDriverLocation({
      latitude: payload.latitude,
      longitude: payload.longitude,
    });
  });
}
