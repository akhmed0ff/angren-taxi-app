import { SOCKET_URL } from '../utils/constants';
import type { Location, Driver } from '../types';

type DriverLocationCallback = (data: { driverId: string; location: Location }) => void;
type OrderStatusCallback = (data: { orderId: string; status: string }) => void;
type DriverAssignedCallback = (data: { orderId: string; driver: Driver }) => void;

type Unsubscribe = () => void;

class SocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private token: string | null = null;

  private listeners: {
    driverLocation: DriverLocationCallback[];
    orderStatus: OrderStatusCallback[];
    driverAssigned: DriverAssignedCallback[];
  } = {
    driverLocation: [],
    orderStatus: [],
    driverAssigned: [],
  };

  connect(token: string): void {
    this.token = token;
    this.reconnectAttempts = 0;
    this.openConnection();
  }

  private openConnection(): void {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(SOCKET_URL);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.ws?.send(JSON.stringify({ type: 'auth', data: { token: this.token } }));
      if (__DEV__) console.log('[Socket] Connected');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as {
          type: string;
          data: unknown;
        };
        this.handleMessage(message.type, message.data);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onerror = () => {
      if (__DEV__) console.error('[Socket] Error');
    };

    this.ws.onclose = () => {
      if (__DEV__) console.log('[Socket] Disconnected');
      this.scheduleReconnect();
    };
  }

  private handleMessage(type: string, data: unknown): void {
    if (type === 'driverLocation') {
      this.listeners.driverLocation.forEach((cb) =>
        cb(data as { driverId: string; location: Location }),
      );
    } else if (type === 'orderStatus') {
      this.listeners.orderStatus.forEach((cb) =>
        cb(data as { orderId: string; status: string }),
      );
    } else if (type === 'driverAssigned') {
      this.listeners.driverAssigned.forEach((cb) =>
        cb(data as { orderId: string; driver: Driver }),
      );
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      if (__DEV__) console.log(`[Socket] Reconnecting (attempt ${this.reconnectAttempts})…`);
      this.openConnection();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent auto-reconnect
    this.ws?.close();
    this.ws = null;
  }

  onDriverLocation(callback: DriverLocationCallback): Unsubscribe {
    this.listeners.driverLocation.push(callback);
    return () => {
      this.listeners.driverLocation = this.listeners.driverLocation.filter((cb) => cb !== callback);
    };
  }

  onOrderStatusChange(callback: OrderStatusCallback): Unsubscribe {
    this.listeners.orderStatus.push(callback);
    return () => {
      this.listeners.orderStatus = this.listeners.orderStatus.filter((cb) => cb !== callback);
    };
  }

  onDriverAssigned(callback: DriverAssignedCallback): Unsubscribe {
    this.listeners.driverAssigned.push(callback);
    return () => {
      this.listeners.driverAssigned = this.listeners.driverAssigned.filter((cb) => cb !== callback);
    };
  }

  removeAllListeners(): void {
    this.listeners.driverLocation = [];
    this.listeners.orderStatus = [];
    this.listeners.driverAssigned = [];
  }
}

export const socketService = new SocketService();
