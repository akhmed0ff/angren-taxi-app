import { io, type Socket } from 'socket.io-client';
import { SocketEvent } from '../types';

type EventHandler = (data: unknown) => void;

declare const process:
  | { env: Record<string, string | undefined> }
  | undefined;

const SOCKET_URL = process?.env?.SOCKET_URL ?? process?.env?.WS_URL ?? 'ws://localhost:3000';
const NORMALIZED_SOCKET_URL = SOCKET_URL.replace(/^ws/i, 'http');

class SocketService {
  private socket: Socket | null = null;
  private handlers = new Map<SocketEvent, Set<EventHandler>>();
  private accessToken: string | null = null;

  connect(accessToken: string): void {
    this.accessToken = accessToken;
    this.openConnection();
  }

  private openConnection(): void {
    if (this.socket?.connected) return;

    this.socket = io(NORMALIZED_SOCKET_URL, {
      transports: ['websocket'],
      auth: this.accessToken ? { token: this.accessToken } : undefined,
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
      this.send('ping', {});
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error', error.message);
    });

    // Re-register existing event handlers if listeners were attached before connect().
    this.handlers.forEach((eventHandlers, event) => {
      eventHandlers.forEach((handler) => this.socket?.on(event, handler));
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  send(event: SocketEvent, data: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[Socket] Cannot send — not connected');
    }
  }

  on(event: SocketEvent, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    this.socket?.on(event, handler);
  }

  off(event: SocketEvent, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  get isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const socketService = new SocketService();
