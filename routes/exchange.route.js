import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  requestExchange,
  acceptRequest,
  rejectRequest,
  getRequestsForMe,
  getMyRequests,
} from "../controllers/exchange.controller.js";

const router = express.Router();
router.post("/request/:bookId", authenticate, requestExchange);
router.put("/accept/:requestId", authenticate, acceptRequest);
router.put("/reject/:requestId", authenticate, rejectRequest);
router.get("/incoming", authenticate, getRequestsForMe);
router.get("/outgoing", authenticate, getMyRequests);

export default router;
