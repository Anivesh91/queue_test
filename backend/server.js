require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initRedis } = require('./src/config/redis');
const { initSockets } = require('./src/sockets/socketHandler');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach socket handlers
initSockets(io);

// Start server
const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Initialize Redis (optional/graceful fallback)
    initRedis();

    // 3. Listen
    server.listen(PORT, () => {
      console.log(`===========================================`);
      console.log(`🚀 QueueLess Backend running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`===========================================`);
    });
  } catch (error) {
    console.error(`[Server Start Error] ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});

startServer();
