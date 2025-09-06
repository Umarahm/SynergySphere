import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSignup, handleLogin, handleVerify } from "./routes/auth";
import projectsRouter from "./routes/projects";
import tasksRouter from "./routes/tasks";
import notificationsRouter from "./routes/notifications";
import usersRouter from "./routes/users";
import chatRouter from "./routes/chat";
import { handleGetUserTimeLogs, handleGetAllTimeLogs } from "./routes/timelog";
import { authenticateToken } from "./middleware/auth";
import { initializeDatabase, getUsersByRole } from "./db";

export function createServer() {
  const app = express();

  // Initialize database with retry logic
  initializeDatabase()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('⚠️  Database connection failed:', error.message);
      console.log('🔄 Application will continue running, retrying database connection in background...');

      // Retry connection after 30 seconds
      setTimeout(() => {
        initializeDatabase()
          .then(() => console.log('✅ Database reconnected successfully'))
          .catch(() => console.log('❌ Database still unavailable'));
      }, 30000);
    });

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/verify", authenticateToken, handleVerify);

  // Projects routes
  app.use("/api/projects", projectsRouter);

  // Tasks routes
  app.use("/api/tasks", tasksRouter);

  // Notifications routes
  app.use("/api/notifications", notificationsRouter);

  // Users routes
  app.use("/api", usersRouter);

  // Chat routes
  app.use("/api/chat", chatRouter);

  // Time log routes
  app.get("/api/timelog/user", authenticateToken, handleGetUserTimeLogs);
  app.get("/api/timelog/all", authenticateToken, handleGetAllTimeLogs);

  return app;
}
