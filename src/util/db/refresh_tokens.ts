import sql from "@/db";
import { type InsertRefreshToken } from "@/types";
import logger from "@/util/logger";

export async function refreshTokenExists(refreshToken: string, userId: string) {
  return await sql`
SELECT EXISTS (
  SELECT 1 FROM refresh_tokens
  WHERE refresh_tokens.refresh_token = ${refreshToken}
  AND refresh_tokens.user_id = ${userId}
  LIMIT 1
)`.then((rows) => rows?.[0]?.exists);
}

export async function deleteRefreshToken(refreshToken: string, userId: string) {
  return await sql`
DELETE FROM refresh_tokens
WHERE refresh_tokens.refresh_token = ${refreshToken}
AND refresh_tokens.user_id = ${userId}
RETURNING *`;
}

export async function insertRefreshToken(data: InsertRefreshToken) {
  return await sql`
INSERT INTO refresh_tokens
(refresh_token, user_id, device)
VALUES
(${data.refresh_token}, ${data.user_id}, ${data.device})
RETURNING *`;
}

export async function rotateRefreshToken(
  data: InsertRefreshToken,
  oldToken?: string
) {
  const deletePromise = oldToken
    ? deleteRefreshToken(oldToken, data.user_id)
    : Promise.resolve();

  const insertRefreshTokenPromise = insertRefreshToken(data);

  const [_, refreshTokenSetteled] = await Promise.allSettled([
    deletePromise,
    insertRefreshTokenPromise,
  ]);

  if (refreshTokenSetteled.status === "rejected") {
    logger.error(refreshTokenSetteled.reason);
  }
}
