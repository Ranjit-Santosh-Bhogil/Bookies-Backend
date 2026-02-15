import Book from "../models/book.model.js";

export const getTrending = async (req, res) => {
  try {
    const { type = "mixed", limit = 10 } = req.query;
    const limitNum = Math.min(30, parseInt(limit) || 10);
    const filter = { active: true };

    let sort = {};
    if (type === "views") {
      sort = { viewCount: -1, createdAt: -1 };
    } else if (type === "requests") {
      sort = { requestCount: -1, createdAt: -1 };
    } else if (type === "recent") {
      sort = { createdAt: -1 };
    } else {
      sort = { viewCount: -1, requestCount: -1, createdAt: -1 };
    }

    const books = await Book.find(filter)
      .populate("owner", "name university profilePicture")
      .sort(sort)
      .limit(limitNum)
      .lean();

    return res.json({ books });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
