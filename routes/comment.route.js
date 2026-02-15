import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addComment,
  getCommentsByBook,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();
router.get("/book/:bookId", getCommentsByBook);
router.post("/book/:bookId", authenticate, addComment);
router.delete("/:commentId", authenticate, deleteComment);

export default router;
