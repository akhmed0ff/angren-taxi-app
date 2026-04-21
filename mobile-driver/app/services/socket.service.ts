import { SocketMessage, SocketEvent } from '../types';

type EventHandler = (data: unknown) => void;

const SOCKET_URL = process.env.SOCKET_URL ?? process.env.WS_URL ?? 'ws://localhost:3000';

class SocketService {
  private ws: WebSocket | null = null;
  private handlers = new Map<SocketEvent, Set<EventHandler>>();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private accessToken: string | null = null;
  private reconnectDelay = 3000;
  private maxReconnectDelay = 30000;
  private shouldReconnect = false;

  connect(accessToken: string): void {
    this.accessToken = accessToken;
    this.shouldReconnect = true;
    this.openConnection();
  }

  private openConnection(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${SOCKET_URL}?token=${this.accessToken ?? ''}`);

    this.ws.onopen = () => {
      console.log('[Socket] Connected');
      this.reconnectDelay = 3000;
      this.send('ping', {});
    };

    this.ws.onmessage = (event: { data?: string }) => {
      const raw = event.data;
      if (!raw) return;
      try {
        const message = JSON.parse(raw) as SocketMessage;
        const eventHandlers = this.handlers.get(message.event);
        eventHandlers?.forEach((handler) => handler(message.data));
      } catch {
        console.warn('[Socket] Failed to parse message', event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[Socket] Error', error);
    };

    this.ws.onclose = () => {
      console.log('[Socket] Disconnected');
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      console.log('[Socket] Reconnecting...');
      this.openConnection();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }, this.reconnectDelay);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  send(event: SocketEvent, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn('[Socket] Cannot send — not connected');
    }
  }

  on(event: SocketEvent, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: SocketEvent, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const socketService = new SocketService();
