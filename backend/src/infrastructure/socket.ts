import { Server as SocketIOServer } from 'socket.io';
import * as http from 'http';

let io: SocketIOServer | null = null;

export function initializeSocket(server: http.Server): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  return io;
}

export function getIo(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
