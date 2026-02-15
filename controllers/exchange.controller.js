import ExchangeRequest from "../models/exchangeRequest.model.js";
import Book from "../models/book.model.js";
import mongoose from "mongoose";

export const requestExchange = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { message } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }
    const book = await Book.findOne({ _id: bookId, active: true });
    if (!book) return res.status(404).json({ message: "Book not found." });
    if (String(book.owner) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot request your own book." });
    }
    if (book.status !== "available") {
      return res.status(400).json({ message: "This book is not available for exchange." });
    }
    const existing = await ExchangeRequest.findOne({
      bookId,
      requesterId: req.user._id,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending request for this book." });
    }
    const exchange = new ExchangeRequest({
      bookId,
      requesterId: req.user._id,
      ownerId: book.owner,
      message: (message || "").trim(),
    });
    await exchange.save();
    book.requestCount += 1;
    book.status = "requested";
    await book.save();
    const populated = await ExchangeRequest.findById(exchange._id)
      .populate("requesterId", "name email university")
      .populate("bookId", "title author");
    return res.status(201).json({ message: "Exchange request sent.", request: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ExchangeRequest.findOne({
      _id: requestId,
      ownerId: req.user._id,
      status: "pending",
    }).populate("bookId");
    if (!request) return res.status(404).json({ message: "Request not found or already processed." });
    request.status = "accepted";
    request.updatedAt = new Date();
    await request.save();
    const book = await Book.findById(request.bookId._id);
    if (book) {
      book.status = "exchanged";
      await book.save();
    }
    await ExchangeRequest.updateMany(
      { bookId: request.bookId._id, _id: { $ne: requestId }, status: "pending" },
      { status: "rejected", updatedAt: new Date() }
    );
    const populated = await ExchangeRequest.findById(requestId)
      .populate("requesterId", "name email university")
      .populate("bookId", "title author");
    return res.json({ message: "Exchange request accepted.", request: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ExchangeRequest.findOne({
      _id: requestId,
      ownerId: req.user._id,
      status: "pending",
    });
    if (!request) return res.status(404).json({ message: "Request not found or already processed." });
    request.status = "rejected";
    request.updatedAt = new Date();
    await request.save();
    const book = await Book.findById(request.bookId);
    if (book && book.status === "requested") {
      const stillPending = await ExchangeRequest.exists({
        bookId: book._id,
        status: "pending",
      });
      if (!stillPending) {
        book.status = "available";
        await book.save();
      }
    }
    return res.json({ message: "Exchange request rejected." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getRequestsForMe = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({ ownerId: req.user._id })
      .populate("requesterId", "name email university profilePicture")
      .populate("bookId", "title author image status")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({ requesterId: req.user._id })
      .populate("ownerId", "name email university profilePicture")
      .populate("bookId", "title author image status")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
