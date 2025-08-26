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

// Import route files
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

// ✅ Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hunt360-one.vercel.app",
  "https://hunt360new-2a0y.onrender.com",
];

// ✅ Enable CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow mobile apps, curl, etc.
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS policy does not allow this origin"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

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
  checkExpirationInterval: 900000, // Clear expired every 15 min
  expiration: 86400000, // Session expiry: 1 day
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
      secure: process.env.NODE_ENV === "production", // Only secure cookies in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ✅ Swagger Docs (if endpoints.yaml exists)
const swaggerPath = path.join(process.cwd(), "public", "endpoints.yaml");
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = YAML.load(swaggerPath);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
} else {
  console.warn("⚠️ Swagger file not found, skipping API docs");
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default function handler(req, res) {
  res.status(200).json({ message: "API is working!" });
}
