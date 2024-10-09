import sql from "@/db";
import type { InsertBook, UpdateBook } from "@/types";
import { type Pagination } from "../validations";

export async function insertBookInDB(book: InsertBook) {
  return await sql`
INSERT INTO books 
(title, author) VALUES
(${book.title}, ${book.author}) 
RETURNING id, title, author, status
`.then((rows) => rows?.[0]);
}

export async function updateBookInDB(id: string, book: UpdateBook) {
  return await sql`
UPDATE books SET
${book.status !== undefined ? sql`status = ${book.status},` : sql``}
title = ${book.title},
author = ${book.author}
WHERE id = ${id}
RETURNING id, title, author, status
`.then((rows) => rows?.[0]);
}

export async function deleteBookInDB(id: string) {
  return await sql`
DELETE FROM books
WHERE id = ${id}
`.then((rows) => rows?.[0]);
}

export async function selectBookById(id: string, isLibrarian?: boolean) {
  return await sql`
SELECT 
  id, title, author, status,
  created_at, updated_at
FROM books
WHERE 
${isLibrarian ? sql`` : sql`status = 'AVAILABLE' AND`}
id = ${id}
`.then((rows) => rows?.[0]);
}

export async function selectBooks(
  pagination: Pagination,
  isLibrarian?: boolean
) {
  const LIMIT = 12;
  const { page } = pagination;
  const offset = (page - 1) * LIMIT;
  return await sql`
SELECT 
  id, title, author,
  status, created_at
FROM books
${isLibrarian ? sql`` : sql`WHERE status = 'AVAILABLE'`}
ORDER BY created_at DESC
LIMIT ${LIMIT}
OFFSET ${offset}
`;
}
