import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import router from "./routes";

dotenv.config({ path: path.join(process.cwd(), "server", ".env") });

import { readUsers, writeUsers } from "./storage";
import { hashPassword } from "./auth";

// Seed demo users if none exist
const seedUsers = () => {
  try {
    const users = readUsers();
    if (users.length === 0) {
      console.log("Seeding demo users...");
      const demoUsers = [
        {
          id: "student-demo-id",
          name: "Student Demo",
          email: "student@edu.com",
          role: "student" as const,
          passwordHash: hashPassword("student123")
        },
        {
          id: "teacher-demo-id",
          name: "Teacher Demo",
          email: "teacher@edu.com",
          role: "teacher" as const,
          passwordHash: hashPassword("teacher123")
        },
        {
          id: "admin-demo-id",
          name: "Admin Demo",
          email: "admin@edu.com",
          role: "admin" as const,
          passwordHash: hashPassword("admin123")
        }
      ];
      writeUsers(demoUsers);
      console.log("Demo users seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};
seedUsers();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", router);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
