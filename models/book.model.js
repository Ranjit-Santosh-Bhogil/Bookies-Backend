import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  university: {
    type: String,
    required: true,
    trim: true,
  },
  condition: {
    type: String,
    enum: ["new", "like_new", "good", "fair", "acceptable"],
    default: "good",
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "requested", "exchanged"],
    default: "available",
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  requestCount: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for search and filter
BookSchema.index({ title: "text", author: "text", subject: "text" });
BookSchema.index({ university: 1 });
BookSchema.index({ owner: 1 });
BookSchema.index({ status: 1 });
BookSchema.index({ createdAt: -1 });

const Book = mongoose.model("Book", BookSchema);
export default Book;
