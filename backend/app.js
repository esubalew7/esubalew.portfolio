import express from "express";          // Import Express framework
import cors from "cors";                // Import CORS middleware
import helmet from "helmet";            // Import Helmet for secure HTTP headers
import cookieParser from "cookie-parser"; // Import cookie-parser for HttpOnly cookie auth
import dotenv from "dotenv";            // Import dotenv for env variables
import { contactLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import contactRoutes from "./routes/contactRoutes.js"; // Import contact routes
import authRoutes from "./routes/authRoutes.js"; // Import auth routes
import projectRoutes from "./routes/projectRoutes.js"; // Import project routes
import uploadRoutes from "./routes/uploadRoutes.js"; // Import upload routes
import dashboardRoutes from "./routes/dashboardRoutes.js"; // Import dashboard routes
import notificationRoutes from "./routes/notificationRoutes.js"; // Import notification routes
import analyticsRoutes from "./routes/analyticsRoutes.js"; // Import analytics routes
import contentRoutes from "./routes/contentRoutes.js"; // Import content routes
import experienceRoutes from "./routes/experienceRoutes.js"; // Import experience routes
import mediaRoutes from "./routes/mediaRoutes.js"; // Import media routes
import twoFactorRoutes from "./routes/twoFactorRoutes.js";
import systemMetricsRoutes from "./routes/systemMetricsRoutes.js";

dotenv.config();                        // Load environment variables from .env

const app = express();                  // Create Express app instance

// Security Middleware (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS Configuration
const parseOrigins = (val) => {
  if (!val) return [];
  return val.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'https://portfolio-mern-one-rho.vercel.app', // Old frontend
  'https://portfolio-mern-bicw.vercel.app',    // Old admin
  'https://esubalew-portfolio.vercel.app',    // New frontend
  'https://esubalew-admin-dashboard.vercel.app', // New admin
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.ADMIN_URL),
];

const normalizedAllowedOrigins = [...new Set(allowedOrigins.map((u) => u.trim().replace(/\/$/, '')))];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    if (
      normalizedAllowedOrigins.includes(cleanOrigin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(cleanOrigin)
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400,
}));

app.use(cookieParser());                // Parse cookies for HttpOnly JWT auth
app.use(express.json());                // Parse incoming JSON requests

// Rate Limiting Middleware
// 100 requests / 15 min for contact route
app.use("/api/contact", contactLimiter);
// 200 requests / 15 min for all other /api/ routes
app.use("/api", apiLimiter);


// Routes
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/auth/2fa", twoFactorRoutes);
app.use("/api/metrics", systemMetricsRoutes);

// Health check routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'portfolio-backend',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Export app
export default app;                     // Export app for use in server.js
