import User from "../models/user.model.js";
import Book from "../models/book.model.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    user.updatedAt = new Date();
    await user.save();
    const updated = await User.findById(user._id).select("-password");
    return res.json({ message: "Profile updated.", user: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getOwnerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("name email university bio profilePicture createdAt");
    if (!user) return res.status(404).json({ message: "User not found." });
    const books = await Book.find({ owner: userId, active: true })
      .populate("owner", "name university")
      .sort({ createdAt: -1 });
    return res.json({ user, books });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
