import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getProfile, updateProfile, getOwnerProfile } from "../controllers/user.controller.js";

const router = express.Router();
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.get("/owner/:userId", getOwnerProfile);

export default router;
