import bcrypt from "bcrypt";
import { config } from "dotenv";
import connectToDatabase from "./config/database.js";
import User from "./models/user.model.js";

config();
await connectToDatabase();

const adminData = {
  firstname: "TrackIt",
  lastname: "Admin",
  email: "admin@gmail.com",
  role: "admin",
  password: "admin123",
};

const setAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const admin = await User.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log("Admin created:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

setAdmin();
