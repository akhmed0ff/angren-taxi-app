import dotenv from 'dotenv';
import * as http from 'http';

dotenv.config();

import { createApp } from './createApp';
import { getDatabase } from './config/database';
import { env } from './config/env';
import { initializeSocket } from './infrastructure/socket';
import { registerSocketHandlers } from './realtime/socket';
import { wsService } from './services/websocket.service';

const app = createApp();

getDatabase();

const server = http.createServer(app);
wsService.init(server);
const _io = initializeSocket(server);
registerSocketHandlers();
server.listen(env.port, () => {
  console.log(`🚕 АНГРЕН ТАКСИ API запущен на порту ${env.port}`);
});

export default app;

