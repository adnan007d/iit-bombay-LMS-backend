import sql from "@/db";
import type { InsertUser } from "@/types";
import { Pagination } from "../validations";

export async function insertUserInDB(user: InsertUser) {
  return await sql`
INSERT INTO users 
(username, email, password, role) VALUES
(${user.username}, ${user.email},
${user.password}, ${user.role}) 
RETURNING id, username, email, role`.then((rows) => rows?.[0]);
}

export async function deleteUserInDB(id: string) {
  return await sql`
UPDATE users SET
deleted = true, deleted_at = now()
WHERE id = ${id} and deleted = false`;
}

export async function updateUserInDB(id: string, user: InsertUser) {
  return await sql`
UPDATE users SET
username = ${user.username}, email = ${user.email},
password = ${user.password}, role = ${user.role}
WHERE id = ${id}`;
}

export async function selectUserByUsername(username: string) {
  return await sql`
SELECT id, username, password, role FROM users
WHERE username = ${username}
AND deleted = false
`.then((rows) => rows?.[0]);
}

export async function getUserById(id: string) {
  return await sql`
SELECT id, username, email, role FROM users
WHERE id = ${id}
AND deleted = false
`.then((rows) => rows?.[0]);
}

export async function selectAllUsers(query: Pagination) {
  const LIMIT = 12;
  const offset = (query.page - 1) * LIMIT;
  return await sql`
SELECT 
  id, username, email, role
FROM users
OFFSET ${offset}
LIMIT ${LIMIT}
`;
}
