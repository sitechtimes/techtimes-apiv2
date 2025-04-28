import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { currentUser } from "./middleware/currentUser";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      process.env.URL + ":8089",
      process.env.URL + ":8000",
      "http://localhost:8089",
      "http://localhost:8000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200, // compatibility or something. blame ie11
  })
);

app.use(express.json());

app.use(currentUser);

const articlesRoutes = require("./routes/articles");
app.use("/articles", articlesRoutes);
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
const cmsRoutes = require("./routes/cms");
app.use("/cms", cmsRoutes);
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

mongoose.connect(process.env.MONGO_URI ?? "").catch((err) => {
  console.error("mongo exploded! do you have .env? ", err);
});

mongoose.connection.once("open", async () => {
  console.log("the mongoose is loose");
  app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
  });
});
