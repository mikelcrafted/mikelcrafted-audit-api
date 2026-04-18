import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import auditRoutes from "./routes/audit.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://www.mikelcrafted.com",
  "https://mikelcrafted.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "MikeL Crafted Audit Tool API",
  });
});

app.use("/api/audit", auditRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});