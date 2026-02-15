import mongoose from "mongoose";

const ExchangeRequestSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  message: {
    type: String,
    default: "",
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

ExchangeRequestSchema.index({ bookId: 1 });
ExchangeRequestSchema.index({ requesterId: 1 });
ExchangeRequestSchema.index({ ownerId: 1 });

const ExchangeRequest = mongoose.model("ExchangeRequest", ExchangeRequestSchema);
export default ExchangeRequest;
