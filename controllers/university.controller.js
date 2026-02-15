import University from "../models/university.model.js";

export const listUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 }).lean();
    return res.json({ universities });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addUniversity = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "University name is required." });
    }
    const existing = await University.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing) {
      return res.status(400).json({ message: "University already registered." });
    }
    const uni = new University({
      name: name.trim(),
      code: (code || "").trim().toUpperCase(),
    });
    await uni.save();
    return res.status(201).json({ message: "University added.", university: uni });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
