import type { InsertBook, UpdateBook } from "@/types";
import {
  deleteBookInDB,
  insertBookInDB,
  selectBookById,
  selectBooks,
  updateBookInDB,
} from "@/util/db/books";
import { APIError } from "@/util/util";
import { paginationSchema } from "@/util/validations";
import type { Request, Response, NextFunction } from "express";
import z from "zod";

const bookId = z.string().uuid({ message: "Invalid book id" });

export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body: InsertBook = req.body;
    const book = await insertBookInDB(body);
    res.json(book);
  } catch (error) {
    next(error);
  }
}

export async function getAllBooks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedQuery = paginationSchema.safeParse(req.query).data!;
    const books = await selectBooks(
      parsedQuery,
      req.user?.role === "LIBRARIAN"
    );
    res.json(books);
  } catch (error) {
    next(error);
  }
}

export async function getBookById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = bookId.parse(req.params.id);
    const book = await selectBookById(id, req.user?.role === "LIBRARIAN");
    if (!book) {
      throw new APIError(404, "Book not found");
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
}

export async function updateBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = bookId.parse(req.params.id);
    const body: UpdateBook = req.body;
    const book = await updateBookInDB(id, body);
    if (!book) {
      throw new APIError(404, "Book not found");
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
}

export async function deleteBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = bookId.parse(req.params.id);
    await deleteBookInDB(id);
    res.json({ message: "Book deleted" });
  } catch (error) {
    next(error);
  }
}
