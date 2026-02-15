import express from "express";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../config/multer.js";
import {
  addBook,
  editBook,
  deleteBook,
  getAllBooks,
  getBookById,
  getBooksByUniversity,
  getBooksByOwner,
  getMyBooks,
} from "../controllers/book.controller.js";

const router = express.Router();
router.get("/", getAllBooks);
router.get("/my-books", authenticate, getMyBooks);
router.get("/university/:university", getBooksByUniversity);
router.get("/owner/:userId", getBooksByOwner);
router.get("/:bookId", getBookById);

router.post("/", authenticate, upload.single("image"), addBook);
router.put("/:bookId", authenticate, upload.single("image"), editBook);
router.delete("/:bookId", authenticate, deleteBook);

export default router;
