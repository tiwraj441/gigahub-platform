// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import ViteExpress from "vite-express";


import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import { fileURLToPath } from "url";

import contactRoutes from "./routes/contact.js";
import adminRoutes, { verifyToken } from "./routes/admin.js";
import Enquiry from "./models/Enquiry.js";


const app = express();

// ---------- MIDDLEWARES ----------
app.use(helmet());
app.use(cors({
   origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Allowed origins (add more if needed, e.g., production domain)
    const allowedOrigins = [
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:3000',
      'http://127.0.0.1:5501'
       // If you use other dev ports
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);  // Log for debugging
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,  // Allows cookies (refresh tokens) to be sent/received
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],  // All common methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],  // For JSON, tokens, etc.
  exposedHeaders: ['Set-Cookie'],  // Expose cookies in response
  preflightContinue: false,  // Let cors handle preflight
  optionsSuccessStatus: 204 // Standard for preflight
}));  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- API ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
// Admin - Fetch Enquiries
app.get("/api/admin/enquiries", verifyToken, async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  res.json(enquiries);
});

// User - Fetch Their Own Enquiries
app.get("/api/enquiries/user", verifyToken, async (req, res) => {
  try {
    // req.user should come from your verifyToken middleware
    const userId = req.user.id;

    // Find enquiries made by this user
    const userEnquiries = await Enquiry.find({ userId }).sort({ createdAt: -1 });

    res.json(userEnquiries);
  } catch (err) {
    console.error("Error fetching user enquiries:", err);
    res.status(500).json({ error: "Server error fetching enquiries" });
  }
});


// ---------- TEST ROUTE ----------
app.get("/", (req, res) => {
  res.send("🚀 Hardware IT Server + Frontend is running...");
});

// ---------- MONGODB + SERVER ----------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");

  ViteExpress.config({
    viteRoot: path.resolve("C:/Users/csecu/OneDrive/Desktop/gigahub_website/frontend")
  });

  const PORT = process.env.PORT || 5000;
  ViteExpress.listen(app, PORT, () => {
    console.log(`🚀 Server + Frontend running on http://localhost:${PORT}`);
  });
})
.catch(err => console.error("❌ MongoDB error:", err));
