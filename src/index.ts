import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database/connection";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGODB_URI as string;

// connect & start server
connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
