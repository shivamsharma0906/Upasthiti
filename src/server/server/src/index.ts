import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config({ path: require("path").join(process.cwd(), "server", ".env") });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", router);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
