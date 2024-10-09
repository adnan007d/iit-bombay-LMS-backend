import {
  insertBorrowInDB,
  returnBookInDB,
  selectBorrowHistory,
  selectBorrowHistoryByBook,
  selectBorrowHistoryByUser,
} from "@/util/db/borrow";
import { borrowQuery } from "@/util/validations";
import type { Request, Response, NextFunction } from "express";
import z from "zod";

const bookId = z.string().uuid({ message: "Invalid book id" });

export async function borrowBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as NonNullable<Request["user"]>;
    const book_id = bookId.parse(req.params.id);
    await insertBorrowInDB(book_id, user.id);
    res.json({ message: "Book borrowed" });
  } catch (error) {
    next(error);
  }
}

export async function returnBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as NonNullable<Request["user"]>;
    const book_id = bookId.parse(req.params.id);
    await returnBookInDB(book_id, user.id);
    res.json({ message: "Book returned" });
  } catch (error) {
    next(error);
  }
}

export async function getBorrowHistoryForUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = z
      .string()
      .uuid({ message: "Invalid user id" })
      .parse(req.params.id);
    const query = borrowQuery.parse(req.query);
    const borrows = await selectBorrowHistoryByUser(user_id, query);
    res.json(borrows);
  } catch (error) {
    next(error);
  }
}

export async function getBorrowHistoryForBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const book_id = bookId.parse(req.params.id);
    const query = borrowQuery.parse(req.query);
    const borrows = await selectBorrowHistoryByBook(book_id, query);
    res.json(borrows);
  } catch (error) {
    next(error);
  }
}

export async function getBorrowHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as NonNullable<Request["user"]>;
    const query = borrowQuery.parse(req.query);
    const promise =
      user.role === "LIBRARIAN"
        ? selectBorrowHistory(query)
        : selectBorrowHistoryByUser(user.id, query);
    const borrows = await promise;
    res.json(borrows);
  } catch (error) {
    next(error);
  }
}
