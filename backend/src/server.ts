import 'dotenv/config';
import app from './app';
import { connectDB, disconnectDB } from '@/core/db/prisma';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📍 API Routes:`);
      console.log(`   GET    /health`);
      console.log(`   POST   /api/drivers`);
      console.log(`   GET    /api/drivers`);
      console.log(`   GET    /api/drivers/available`);
      console.log(`   POST   /api/orders`);
      console.log(`   GET    /api/orders`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await disconnectDB();
    process.exit(1);
  }
}

startServer();
