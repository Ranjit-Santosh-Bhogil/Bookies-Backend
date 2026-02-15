import "dotenv/config";
import mongoose from "mongoose";
import University from "../models/university.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bookies";

const SAMPLE_UNIVERSITIES = [
  "MIT",
  "Stanford University",
  "Harvard University",
  "Oxford University",
  "Cambridge University",
  "University of California, Berkeley",
  "Carnegie Mellon University",
  "Georgia Institute of Technology",
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  for (const name of SAMPLE_UNIVERSITIES) {
    await University.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${name}$`, "i") } },
      { $setOnInsert: { name } },
      { upsert: true }
    );
  }
  console.log("Universities seeded.");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@bookies.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashed,
      university: SAMPLE_UNIVERSITIES[0],
      role: "admin",
    });
    console.log("Admin user created:", adminEmail);
  }
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
