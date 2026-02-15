import Comment from "../models/comment.model.js";
import Book from "../models/book.model.js";
import mongoose from "mongoose";

export const addComment = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Comment text is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }
    const book = await Book.findOne({ _id: bookId, active: true });
    if (!book) return res.status(404).json({ message: "Book not found." });
    const comment = new Comment({
      userId: req.user._id,
      bookId,
      body: body.trim(),
    });
    await comment.save();
    const populated = await Comment.findById(comment._id)
      .populate("userId", "name university profilePicture");
    return res.status(201).json({ message: "Comment added.", comment: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getCommentsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }
    const comments = await Comment.find({ bookId })
      .populate("userId", "name university profilePicture")
      .sort({ createdAt: 1 })
      .lean();
    return res.json({ comments });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findOne({ _id: commentId, userId: req.user._id });
    if (!comment) return res.status(404).json({ message: "Comment not found or you cannot delete it." });
    await Comment.findByIdAndDelete(commentId);
    return res.json({ message: "Comment deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
