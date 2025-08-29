import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import multer from "multer";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import MySQLStoreFactory from "express-mysql-session";

import authRoutes from "./routes/auth.routes.js";
import campusRoutes from "./routes/campus.routes.js";
import corporateRoutes from "./routes/corporate.routes.js";
import hrhuntRoutes from "./routes/hrhunt.routes.js";
import emailRoutes from "./routes/email.routes.js";
import linkedinRoutes from "./routes/linkedin.routes.js";
import "./utils/warmup.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",                // local dev
  "http://localhost:5174",
  "http://localhost:8080",
  "https://hunt360-kaaq.vercel.app",      // frontend on vercel
  "https://hunt360new-3371.onrender.com"  // backend on render
];

// ✅ CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle Preflight Requests
app.options("*", cors());

// ✅ Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MySQL Session Store
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
});

// ✅ Session Middleware
app.use(
  session({
    key: "session_id",
    secret: process.env.SESSION_SECRET || "supersecretkey",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ✅ Swagger Docs
const swaggerPath = path.join(process.cwd(), "public", "endpoints.yaml");
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = YAML.load(swaggerPath);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
}

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/campus", campusRoutes);
app.use("/api/hrhunt", hrhuntRoutes);
app.use("/api/corporate", corporateRoutes);
app.use("/api/email-service", emailRoutes);
app.use("/api/linkedin", linkedinRoutes);

// ✅ Health Check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
