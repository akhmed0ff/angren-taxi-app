import {
  connectSocket,
  disconnectSocket,
  getSocket,
  subscribeToRide,
  unsubscribeFromRide,
} from '../socket';
import type { Location } from '../types';

type LocationCallback = (data: { driverId: string; location: Location }) => void;
type StatusCallback = (data: { orderId: string; status: string }) => void;

export const socketService = {
  connect(token: string) {
    connectSocket(token);
  },

  disconnect() {
    disconnectSocket();
  },

  subscribeToOrder(orderId: string) {
    subscribeToRide(orderId);
  },

  unsubscribeFromOrder(orderId: string) {
    unsubscribeFromRide(orderId);
  },

  onOrderStatusChange(callback: StatusCallback): () => void {
    const socket = getSocket();
    if (!socket) return () => {};

    const acceptedHandler = (p: { rideId: string }) =>
      callback({ orderId: p.rideId, status: 'accepted' });
    const startedHandler = (p: { rideId: string }) =>
      callback({ orderId: p.rideId, status: 'in_progress' });
    const completedHandler = (p: { rideId: string }) =>
      callback({ orderId: p.rideId, status: 'completed' });

    socket.on('ride:accepted', acceptedHandler);
    socket.on('ride:started', startedHandler);
    socket.on('ride:completed', completedHandler);

    return () => {
      socket.off('ride:accepted', acceptedHandler);
      socket.off('ride:started', startedHandler);
      socket.off('ride:completed', completedHandler);
    };
  },

  onDriverLocation(callback: LocationCallback): () => void {
    const socket = getSocket();
    if (!socket) return () => {};

    const handler = (payload: { driverId: string; latitude: number; longitude: number }) =>
      callback({
        driverId: payload.driverId,
        location: { latitude: payload.latitude, longitude: payload.longitude },
      });

    socket.on('driver:location', handler);
    return () => {
      socket.off('driver:location', handler);
    };
  },
};
