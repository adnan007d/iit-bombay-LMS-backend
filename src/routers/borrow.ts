import {
  borrowBook,
  getBorrowHistory,
  getBorrowHistoryForBook,
  getBorrowHistoryForUser,
  returnBook,
} from "@/controllers/borrows";
import { adminOnly, authenticate } from "@/middleware/authenticate";
import { Router } from "express";

const borrowRouter = Router();

borrowRouter.get("/history", authenticate, getBorrowHistory);
borrowRouter.get(
  "/history/books/:id",
  authenticate,
  adminOnly,
  getBorrowHistoryForBook
);
borrowRouter.get(
  "/history/users/:id",
  authenticate,
  adminOnly,
  getBorrowHistoryForUser
);
borrowRouter.post("/:id", authenticate, borrowBook);
borrowRouter.post("/:id/return", authenticate, returnBook);

export default borrowRouter;
