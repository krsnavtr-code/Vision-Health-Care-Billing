import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import staffInvoiceRoutes from "./routes/staffInvoiceRoutes.js";

// Only set DNS in development/local environment
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

dotenv.config();

const app = express();
app.use(
  cors({
    exposedHeaders: ["Content-Disposition"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env file!");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/business-details", businessRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff-invoices", staffInvoiceRoutes);

// Base welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Vision Health Care Billing API!" });
});

const server = http.createServer(app);

// Socket.io setup for Real-time communication
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Room join logic
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

const PORT = process.env.PORT || 6002;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
