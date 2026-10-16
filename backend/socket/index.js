import { Server } from 'socket.io';
import { joinAdminRoom, joinPortfolioRoom, leaveAllRooms } from './rooms.js';
import Visitor from '../models/Visitor.js';

let io;

export function setupSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175',
          'http://localhost:3000',
          'https://portfolio-mern-one-rho.vercel.app', // old
          "https://portfolio-mern-bicw.vercel.app", // old
          'https://esubalew-portfolio.vercel.app', //new
          'https://esubalew-admin-dashboard.vercel.app' //new
        ];
        if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('join:admin', () => {
      joinAdminRoom(socket);
      console.log(`[Socket] ${socket.id} joined admin room`);
    });

    const sendVisitorCount = async (targetSocket) => {
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const count = await Visitor.countDocuments({ createdAt: { $gte: startOfDay } });
        targetSocket.emit('visitor:count_update', { count: Math.max(count, 1) });
      } catch (err) {
        console.error('[Socket] Error sending visitor count:', err.message);
      }
    };

    socket.on('join:portfolio', () => {
      joinPortfolioRoom(socket);
      console.log(`[Socket] ${socket.id} joined portfolio room`);
      sendVisitorCount(socket);
    });

    socket.on('join:visitor_room', () => {
      joinPortfolioRoom(socket);
      console.log(`[Socket] ${socket.id} joined visitor_room`);
      sendVisitorCount(socket);
    });

    socket.on('content_updated', (payload) => {
      console.log(`[Socket] content_updated received from ${socket.id}`);
      io.to('portfolio').emit('content_updated', payload);
      io.to('visitor_room').emit('content_updated', payload);
      io.emit('content_updated', payload);
    });

    socket.on('disconnect', (reason) => {
      leaveAllRooms(socket);
      console.log(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
