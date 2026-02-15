import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import { listUniversities, addUniversity } from "../controllers/university.controller.js";

const router = express.Router();
router.get("/", listUniversities);
router.post("/", authenticate, isAdmin, addUniversity);

export default router;
