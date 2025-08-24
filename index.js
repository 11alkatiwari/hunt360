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

// ✅ Multer (for file uploads)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hunt360.vercel.app",
  "https://hunt360.onrender.com",
];

// ✅ Enable CORS
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
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MySQL Session Store (Production-Ready)
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "test_db",
});

app.use(
  session({
    key: "session_cookie_name",
    secret: process.env.SESSION_SECRET || "ashlokchaudhary",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // ✅ Secure cookies in production
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// ✅ Swagger Docs (optional, load only if file exists)
const swaggerPath = path.resolve(process.cwd(), "docs/endpoints.yaml");
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = YAML.load(swaggerPath);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
} else {
  console.warn("⚠️ Swagger file not found, skipping API docs");
}

// ✅ Routes
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

export default app;
