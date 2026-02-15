import User from "../models/user.model.js";
import University from "../models/university.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bookies_jwt_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

export const register = async (req, res) => {
  try {
    const { name, email, password, university } = req.body;

    if (!name || !email || !password || !university) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const uni = await University.findOne({
      name: { $regex: new RegExp(`^${university.trim()}$`, "i") },
    });
    if (!uni) {
      return res.status(400).json({
        message: "Only students from registered universities can join. Your university is not in our list.",
      });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      university: uni.name,
    });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    const userResponse = await User.findById(newUser._id).select("-password");

    return res.status(201).json({
      message: "User created successfully.",
      token,
      user: userResponse,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.active) {
      return res.status(401).json({ message: "Account is deactivated." });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    const userResponse = await User.findById(user._id).select("-password");

    return res.json({
      message: "Login successful.",
      token,
      user: userResponse,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
