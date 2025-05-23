// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import { app } from "./app.js";

dotenv.config({
  path: ".env",
});

// const app = express();

// app.get('/', (req, res) => {
//   res.json({ message: 'Hello, Early-Pulse backend!' });
// });

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;

    app.on("error", (error) => {
      console.log("ERR: ", error);
      throw error;
    });

    app.listen(port, () => {
      console.log(`Server is running at PORT: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!!", err);
  });
