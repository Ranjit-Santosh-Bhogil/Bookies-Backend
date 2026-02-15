import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import bookRoutes from "./routes/book.route.js";
import commentRoutes from "./routes/comment.route.js";
import exchangeRoutes from "./routes/exchange.route.js";
import trendingRoutes from "./routes/trending.route.js";
import universityRoutes from "./routes/university.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/universities", universityRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ message: "File too large. Max 5MB." });
  }
  res.status(err.status || 500).json({ message: err.message || "Server error." });
});

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err.message);
    process.exit(1);
  }
};

start();
