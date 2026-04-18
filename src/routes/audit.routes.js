import express from "express";
import { runAudit } from "../controllers/audit.controller.js";

const router = express.Router();

router.post("/", runAudit);

export default router;