import sql from "@/db";
import { APIError } from "../util";
import { type BorrowQuery } from "../validations";

export async function insertBorrowInDB(book_id: string, user_id: string) {
  await sql.begin(async (sql) => {
    const [updatedBook] = await sql`
      UPDATE books SET
      status = 'BORROWED'
      WHERE id = ${book_id} AND status = 'AVAILABLE'
      RETURNING id
      `;

    if (!updatedBook) {
      throw new APIError(404, "Book not found");
    }

    await sql`
      INSERT INTO borrows (user_id, book_id)
      VALUES (${user_id}, ${book_id})
      RETURNING id`;
  });
}

export async function returnBookInDB(book_id: string, user_id: string) {
  await sql.begin(async (sql) => {
    const [updatedBook] = await sql`
      UPDATE books SET
      status = 'AVAILABLE'
      WHERE id = ${book_id} AND status = 'BORROWED'
      RETURNING id
      `;

    if (!updatedBook) {
      throw new APIError(404, "Book not found");
    }

    await sql`
      UPDATE borrows SET
      returned_at = now()
      WHERE user_id = ${user_id} AND book_id = ${book_id} AND returned_at IS NULL
    `;
  });
}

// FOR MEMBER AND LIBRARIAN
export async function selectBorrowHistoryByUser(
  user_id: string,
  query: BorrowQuery
) {
  const LIMIT = 12;
  const OFFSET = (query.page - 1) * LIMIT;

  const borrowedOrAll =
    query.type === "BORROWED" ? sql`AND returned_at IS NULL` : sql``;

  return await sql`
SELECT 
  borrows.id, borrows.book_id,
  books.title, books.author,
  borrowed_at, returned_at
FROM borrows
LEFT JOIN books ON borrows.book_id = books.id
WHERE user_id = ${user_id} ${borrowedOrAll} 
ORDER BY borrows.created_at DESC
OFFSET ${OFFSET}
LIMIT ${LIMIT}
`;
}

// For LIBRARIAN
export async function selectBorrowHistoryByBook(
  book_id: string,
  query: BorrowQuery
) {
  const LIMIT = 12;
  const OFFSET = (query.page - 1) * LIMIT;
  const borrowedOrAll =
    query.type === "BORROWED" ? sql`AND returned_at IS NULL` : sql``;

  return await sql`
SELECT 
  borrows.id, borrows.user_id, 
  users.username, users.email,
  borrowed_at, returned_at
FROM borrows
LEFT JOIN users ON borrows.user_id = users.id
WHERE book_id = ${book_id} ${borrowedOrAll}
ORDER BY borrows.created_at DESC 
OFFSET ${OFFSET}
LIMIT ${LIMIT}
`;
}

// For LIBRARIAN
export async function selectBorrowHistory(query: BorrowQuery) {
  const LIMIT = 12;
  const OFFSET = (query.page - 1) * LIMIT;

  return await sql`
SELECT 
  borrows.id, borrows.user_id, borrows.book_id, 
  books.title, books.author,
  users.username, users.email,
  borrowed_at, returned_at
FROM borrows
LEFT JOIN books ON borrows.book_id = books.id
LEFT JOIN users ON borrows.user_id = users.id
${query.type === "BORROWED" ? sql`WHERE returned_at IS NULL` : sql``}
ORDER BY borrows.created_at DESC
OFFSET ${OFFSET}
LIMIT ${LIMIT}
`;
}
