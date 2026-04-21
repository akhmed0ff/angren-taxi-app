import { WebSocket, WebSocketServer as WsServer } from 'ws';
import * as http from 'http';
import { verifyToken } from '../utils/jwt';

class WebSocketService {
  private clients = new Map<string, WebSocket>();

  init(server: http.Server): void {
    const wss = new WsServer({ server });
    wss.on('connection', (ws, req) => {
      const url = new URL(req.url ?? '', 'http://localhost');
      const token = url.searchParams.get('token');
      try {
        const payload = verifyToken(token ?? '');
        this.clients.set(payload.userId, ws);
        ws.on('close', () => this.clients.delete(payload.userId));
      } catch {
        ws.close(1008, 'Invalid token');
      }
    });
  }

  sendToUser(userId: string, type: string, data: unknown): void {
    const ws = this.clients.get(userId);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data }));
    }
  }
}

export const wsService = new WebSocketService();
