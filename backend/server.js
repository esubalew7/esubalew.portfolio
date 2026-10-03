import http from 'http';
import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { setupSocket } from "./socket/index.js";
import { initDefaultAdmin } from "./services/initService.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
setupSocket(httpServer);

// Start HTTP server immediately to prevent "Network Error" (connection refused)
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Asynchronously connect to database & initialize default admin and content
(async () => {
  try {
    await connectDB();
    await initDefaultAdmin();
  } catch (error) {
    console.error('⚠️ Database connection failure during startup:', error.message);
  }
})();