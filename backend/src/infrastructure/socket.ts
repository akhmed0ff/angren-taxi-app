import { Server as SocketIOServer } from 'socket.io';
import * as http from 'http';
import { env } from '../config/env';

let io: SocketIOServer | null = null;

export function initializeSocket(server: http.Server): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : false,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  return io;
}

export function getIo(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
