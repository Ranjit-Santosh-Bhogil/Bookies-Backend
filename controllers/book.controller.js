import Book from "../models/book.model.js";
import mongoose from "mongoose";

export const addBook = async (req, res) => {
  try {
    const { title, author, subject, condition, description } = req.body;
    if (!title || !author || !subject) {
      return res.status(400).json({ message: "Title, author and subject are required." });
    }
    const university = req.user.university;
    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const book = new Book({
      title: title.trim(),
      author: author.trim(),
      subject: subject.trim(),
      university,
      condition: condition || "good",
      description: (description || "").trim(),
      image,
      owner: req.user._id,
    });
    await book.save();
    const populated = await Book.findById(book._id).populate("owner", "name email university");
    return res.status(201).json({ message: "Book added.", book: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const editBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, subject, condition, description } = req.body;
    const book = await Book.findOne({ _id: bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ message: "Book not found or you are not the owner." });
    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (subject !== undefined) book.subject = subject.trim();
    if (condition !== undefined) book.condition = condition;
    if (description !== undefined) book.description = description.trim();
    if (req.file) book.image = `/uploads/${req.file.filename}`;
    book.updatedAt = new Date();
    await book.save();
    const populated = await Book.findById(book._id).populate("owner", "name email university");
    return res.json({ message: "Book updated.", book: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findOne({ _id: bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ message: "Book not found or you are not the owner." });
    book.active = false;
    await book.save();
    return res.json({ message: "Book deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const { university, status, search, page = 1, limit = 20 } = req.query;
    const filter = { active: true };
    if (university) filter.university = new RegExp(university, "i");
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { author: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
      ];
    }
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit));
    const limitNum = Math.min(50, parseInt(limit));
    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate("owner", "name university profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Book.countDocuments(filter),
    ]);
    return res.json({ books, total, page: parseInt(page), limit: limitNum });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }
    const book = await Book.findOne({ _id: bookId, active: true })
      .populate("owner", "name email university profilePicture bio");
    if (!book) return res.status(404).json({ message: "Book not found." });
    book.viewCount += 1;
    await book.save();
    return res.json({ book });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getBooksByUniversity = async (req, res) => {
  try {
    const { university } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const filter = { active: true, university: new RegExp(university, "i") };
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit));
    const limitNum = Math.min(50, parseInt(limit));
    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate("owner", "name university profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Book.countDocuments(filter),
    ]);
    return res.json({ books, total, page: parseInt(page), limit: limitNum });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getBooksByOwner = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const filter = { active: true, owner: userId };
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit));
    const limitNum = Math.min(50, parseInt(limit));
    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate("owner", "name university profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Book.countDocuments(filter),
    ]);
    return res.json({ books, total, page: parseInt(page), limit: limitNum });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id, active: true })
      .populate("owner", "name university profilePicture")
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ books });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
