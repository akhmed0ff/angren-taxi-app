import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let ioInstance: Server | null = null;

/**
 * Creates and attaches the Socket.IO server to the given HTTP server.
 * Must be called once during server startup, before registerSocketHandlers().
 */
export function initializeSocket(httpServer: HttpServer): Server {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
    transports: ['websocket', 'polling'],
  });

  return ioInstance;
}

/**
 * Returns the Socket.IO server instance.
 * Throws if called before initializeSocket().
 */
export function getIo(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized. Call initializeSocket() first.');
  }

  return ioInstance;
}

export type { Server };
