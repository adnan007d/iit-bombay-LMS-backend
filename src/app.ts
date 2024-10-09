import express from "express";
import cors from "cors";
import helmet from "helmet";
import usersRouter from "@/routers/users";
import { errorHandler } from "@/middleware/errorHandler";
// @ts-expect-error - No need for types
import cookieParser from "cookie-parser";
import booksRouter from "@/routers/books";
import borrowRouter from "@/routers/borrow";

const app = express();

const whitelist = [
  "http://localhost:3000",
  "https://iit-bombay-lms-backend.onrender.com/",
  "https://iit-bombay-lms-frontend.vercel.app",
];
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin!) !== -1) {
        console.log(origin);
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    exposedHeaders: ["Authorization"],
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", usersRouter);
app.use("/api/books", booksRouter);
app.use("/api/borrows", borrowRouter);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);
export default app;
