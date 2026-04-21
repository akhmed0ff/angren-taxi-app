import { getIo } from '../infrastructure/socket';
import { DriverService } from '../modules/driver/driver.service';
import type { RideWithRelations } from '../modules/rides/ride.types';

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

export interface DriverLocationPayload {
  driverId: string;
  latitude: number;
  longitude: number;
  rideId?: string;
}

export interface RideStatusPayload {
  rideId: string;
  status: string;
  driverId?: string | null;
  passengerId?: string | null;
}

export interface RideCreatedPayload {
  ride: RideWithRelations;
}

export interface RideAcceptedPayload {
  rideId: string;
  driverId: string;
}

export interface RideStartedPayload {
  rideId: string;
}

export interface RideCompletedPayload {
  rideId: string;
  price: number;
}

function moveRoomMembersToRideRoom(sourceRoom: string, rideId: string): void {
  const io = getIo();
  const rideRoom = `ride:${rideId}`;
  const members = io.sockets.adapter.rooms.get(sourceRoom);

  if (!members || members.size === 0) {
    return;
  }

  for (const socketId of members) {
    io.sockets.sockets.get(socketId)?.join(rideRoom);
  }
}

const driverService = new DriverService();

/**
 * Registers all Socket.IO event handlers.
 * Must be called after initializeSocket() in server.ts.
 */
export function registerSocketHandlers(): void {
  const io = getIo();

  io.on('connection', (socket) => {
    socket.on('ride:subscribe', (rideId: string) => {
      if (typeof rideId === 'string' && rideId.trim().length > 0) {
        socket.join(`ride:${rideId}`);
      }
    });

    socket.on('ride:unsubscribe', (rideId: string) => {
      if (typeof rideId === 'string' && rideId.trim().length > 0) {
        socket.leave(`ride:${rideId}`);
      }
    });

    socket.on('driver:subscribe', (driverId: string) => {
      if (typeof driverId === 'string' && driverId.trim().length > 0) {
        socket.join(`driver:${driverId}`);
      }
    });

    socket.on('driver:location', async (payload: DriverLocationPayload) => {
      try {
        if (
          !payload
          || typeof payload.driverId !== 'string'
          || typeof payload.latitude !== 'number'
          || typeof payload.longitude !== 'number'
          || typeof payload.rideId !== 'string'
          || payload.rideId.trim().length === 0
        ) {
          socket.emit('driver:location:error', { message: 'Invalid payload' });
          return;
        }

        await driverService.updateLocation(payload.driverId, payload.latitude, payload.longitude);

        emitDriverLocation({
          driverId: payload.driverId,
          latitude: payload.latitude,
          longitude: payload.longitude,
          rideId: payload.rideId,
        });
      } catch (error: any) {
        socket.emit('driver:location:error', {
          message: error?.message ?? 'Failed to update driver location',
        });
      }
    });
  });
}

/** @deprecated Use getIo() from @/infrastructure/socket directly */
export function getSocketServer() {
  return getIo();
}

// ---------------------------------------------------------------------------
// Ride lifecycle emitters
// ---------------------------------------------------------------------------

/**
 * Emitted after a ride is created.
 * Sent to the passenger's personal room so they receive it immediately.
 */
export function emitRideCreated(payload: RideCreatedPayload): void {
  try {
    const io = getIo();
    moveRoomMembersToRideRoom(`passenger:${payload.ride.userId}`, payload.ride.id);
    io.to(`passenger:${payload.ride.userId}`).emit('ride:created', payload);
  } catch {
    // Socket.IO not yet initialized — skip emit
  }
}

/**
 * Emitted after a driver accepts the ride.
 * Sent to the shared ride room (both passenger and driver subscribe to it).
 */
export function emitRideAccepted(payload: RideAcceptedPayload): void {
  try {
    const io = getIo();
    moveRoomMembersToRideRoom(`driver:${payload.driverId}`, payload.rideId);
    io.to(`ride:${payload.rideId}`).emit('ride:accepted', payload);
    io.to(`driver:${payload.driverId}`).emit('ride:accepted', payload);
  } catch {
    // Socket.IO not yet initialized — skip emit
  }
}

/**
 * Emitted after the ride starts (driver picks up the passenger).
 * Sent to the shared ride room.
 */
export function emitRideStarted(payload: RideStartedPayload): void {
  try {
    const io = getIo();
    io.to(`ride:${payload.rideId}`).emit('ride:started', payload);
  } catch {
    // Socket.IO not yet initialized — skip emit
  }
}

/**
 * Emitted after the ride is completed.
 * Sent to the shared ride room.
 */
export function emitRideCompleted(payload: RideCompletedPayload): void {
  try {
    const io = getIo();
    io.to(`ride:${payload.rideId}`).emit('ride:completed', payload);
  } catch {
    // Socket.IO not yet initialized — skip emit
  }
}

// ---------------------------------------------------------------------------
// Legacy generic emitter (kept for backward compatibility)
// ---------------------------------------------------------------------------

export function emitRideStatusUpdated(payload: RideStatusPayload): void {
  try {
    const io = getIo();
    io.to(`ride:${payload.rideId}`).emit('ride:status:updated', payload);

    if (payload.driverId) {
      io.to(`driver:${payload.driverId}`).emit('ride:status:updated', payload);
    }

    if (payload.passengerId) {
      io.to(`passenger:${payload.passengerId}`).emit('ride:status:updated', payload);
    }
  } catch {
    // Socket.IO not yet initialized — skip emit
  }
}

export function emitDriverLocationUpdated(payload: DriverLocationPayload): void {
  try {
    const io = getIo();
    io.to(`driver:${payload.driverId}`).emit('driver:location:updated', payload);

    if (payload.rideId) {
      io.to(`ride:${payload.rideId}`).emit('driver:location:updated', payload);
    }
  } catch {
    // Socket.IO not yet initialized — skip emit
  }
}

// ---------------------------------------------------------------------------
// driver:location — short-form alias used by mobile clients
// ---------------------------------------------------------------------------

/**
 * Emits 'driver:location' to the ride room (compact event for mobile consumers).
 */
export function emitDriverLocation(payload: DriverLocationPayload): void {
  try {
    const io = getIo();
    if (payload.rideId) {
      io.to(`ride:${payload.rideId}`).emit('driver:location', payload);
    }
  } catch {
    // Socket.IO not yet initialized — skip emit
  }
}
