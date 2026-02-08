import compression from "compression";
import cors from "cors";
import express, { Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, try again later.",
  skip: (req) => req.method === "OPTIONS",
});

export const loginLimiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts, try again later.",
  skip: (req) => req.method === "OPTIONS",
});

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pjswag-store.vercel.app",
    "https://pjswag-dashboard.vercel.app",
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 204,
};

export const applySecurity = (app: Application) => {
  /* 1️⃣ Handle CORS first (IMPORTANT) */
  app.use(cors(corsOptions));
  // app.options("/*", cors(corsOptions)); // Preflight handle
  // app.options("/api/:path(*)", cors(corsOptions)); // path param explicit

  /* 2️⃣ Helmet security headers */
  app.use(
    helmet({
      contentSecurityPolicy: false, // frontend (Next/Vercel) এর জন্য safe
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(helmet.frameguard({ action: "deny" }));
  app.use(helmet.noSniff());

  /* 3️⃣ Rate limiting */
  app.use(globalLimiter);

  /* 4️⃣ Prevent HTTP parameter pollution */
  app.use(
    hpp({
      whitelist: ["products"], // duplicate allowed params
    }),
  );

  /* 5️⃣ Compression */
  app.use(compression());

  /* 6️⃣ Body parsers (payload protection) */
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
};
