import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from "@/controllers/books";
import { adminOnly, authenticate } from "@/middleware/authenticate";
import { validateBody } from "@/middleware/validations";
import { bookSchema, bookSchemaUpdate } from "@/util/validations";
import { Router } from "express";

const booksRouter = Router();

booksRouter.post(
  "/",
  authenticate,
  adminOnly,
  validateBody(bookSchema),
  createBook
);
booksRouter.get("/", getAllBooks);
booksRouter.get("/admin", authenticate, adminOnly, getAllBooks);
booksRouter.get("/:id", getBookById);
booksRouter.get("/admin/:id", authenticate, adminOnly, getBookById);
booksRouter.put(
  "/:id",
  authenticate,
  adminOnly,
  validateBody(bookSchemaUpdate),
  updateBook
);
booksRouter.delete("/:id", authenticate, adminOnly, deleteBook);

export default booksRouter;
