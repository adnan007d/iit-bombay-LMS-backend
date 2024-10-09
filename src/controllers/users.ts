import type { InsertUser } from "@/types";
import {
  deleteRefreshToken,
  rotateRefreshToken,
} from "@/util/db/refresh_tokens";
import {
  deleteUserInDB,
  getUserById,
  insertUserInDB,
  selectAllUsers,
  selectUserByUsername,
  updateUserInDB,
} from "@/util/db/user";
import { generateTokens } from "@/util/jwt";
import logger from "@/util/logger";
import {
  APIError,
  comparePassword,
  COOKIE_OPTIONS,
  hashPassword,
} from "@/util/util";
import { loginSchema, paginationSchema } from "@/util/validations";
import type { Request, Response, NextFunction } from "express";
import { PostgresError } from "postgres";
import z from "zod";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body: InsertUser = req.body;
    body.password = await hashPassword(body.password);
    const user = await insertUserInDB(body);
    res.json(user);
  } catch (error) {
    // Handling unique constraint errors
    if (error instanceof PostgresError) {
      logger.error(error);
      const apiError = new APIError(400, "Bad Request");
      if (error.code === "23505") {
        if (error.constraint_name === "users_email_key") {
          apiError.message = "Email already exists";
        } else if (error.constraint_name === "users_username_key") {
          apiError.message = "Username already taken";
        }
      }
      next(apiError);
      return;
    }

    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = z
      .string()
      .uuid({ message: "Invalid user id" })
      .parse(req.params.id);
    const body = req.body;
    body.password = await hashPassword(body.password);
    await updateUserInDB(id, body);

    res.json({ message: "User updated" });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user as NonNullable<Request["user"]>;
    await deleteUserInDB(user.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
}

export async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    const body = await validateSignInBody(req.body);
    const user = await selectUserByUsername(body.username);
    // If user is not found
    if (!user) {
      throw new APIError(401, "Invalid username or password");
    }

    // If password is not correct
    if (!(await comparePassword(body.password, user.password))) {
      throw new APIError(401, "Invalid username or password");
    }

    const { accessToken, refreshToken } = await generateTokens({
      role: user.role,
      id: user.id,
    });

    await rotateRefreshToken(
      {
        refresh_token: refreshToken,
        user_id: user.id,
        device: req.headers["user-agent"] ?? null,
      },
      req.cookies.refreshToken || req.body.refreshToken
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken, req.user!.id);
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as NonNullable<Request["user"]>).id;

    const user = await getUserById(userId);

    if (!user) {
      throw new APIError(401, "Unauthorized");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function getAUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = z
      .string()
      .uuid({ message: "Invalid user id" })
      .parse(req.params.id);
    const user = await getUserById(userId);
    if (!user) {
      throw new APIError(404, "User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function getAllUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = paginationSchema.parse(req.query);
    const users = await selectAllUsers(query);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function deleteUserAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = z
      .string()
      .uuid({ message: "Invalid user id" })
      .parse(req.params.id);
    await deleteUserInDB(userId);
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
}

// This is because I want to send Invalid email/password message
// Even if the validation is failing for security purpose
async function validateSignInBody(body: unknown) {
  const parsedBody = loginSchema.safeParse(body);
  if (!parsedBody.success) {
    logger.error({ err: parsedBody.error }, "Validation error");
    throw new APIError(401, "Invalid email/password");
  }
  return parsedBody.data;
}
