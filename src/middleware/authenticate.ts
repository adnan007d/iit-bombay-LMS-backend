import {
  refreshTokenExists,
  rotateRefreshToken,
} from "@/util/db/refresh_tokens";
import {
  generateTokens,
  safeVerifyAccessToken,
  verifyRefreshToken,
} from "@/util/jwt";
import logger from "@/util/logger";
import { APIError, COOKIE_OPTIONS } from "@/util/util";
import type { Request, Response, NextFunction } from "express";
import { type JWTPayload } from "jose";
import { JWTExpired } from "jose/errors";

declare module "express" {
  export interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}

const UNAUTHORIZED_ERROR = new APIError(401, "Unauthorized");

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  try {
    if (!token) {
      logger.error("No token");
      throw UNAUTHORIZED_ERROR;
    }

    const { status, payload } = await safeVerifyAccessToken(token);

    switch (status) {
      case "valid":
        if (payload) await handleValidToken(req, payload);
        break;
      case "expired":
        if (payload) await handleExpiredToken(req, res, payload);
        break;
      default:
        logger.error("Invalid token");
        throw UNAUTHORIZED_ERROR;
    }

    return next();
  } catch (error) {
    // Refresh token is invalid/expired
    if (error instanceof JWTExpired) {
      logger.error(error, "Refresh token expired");
    }
    res.clearCookie("refreshToken");
    return next(UNAUTHORIZED_ERROR);
  }
}

async function handleValidToken(req: Request, payload: JWTPayload) {
  req.user = payload;
  return;
}

async function handleExpiredToken(
  req: Request,
  res: Response,
  accessPayload: JWTPayload
) {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw UNAUTHORIZED_ERROR;
  }

  const { payload: refreshPayload } = await verifyRefreshToken(refreshToken);
  if (!accessPayload || refreshPayload.id !== accessPayload.id) {
    logger.error("Refresh token not valid");
    throw UNAUTHORIZED_ERROR;
  }

  const foundToken = await refreshTokenExists(refreshToken, accessPayload.id);
  if (!foundToken) {
    logger.error("Refresh token not found in DB");
    throw UNAUTHORIZED_ERROR;
  }

  await refreshTokens(req, res, refreshPayload);
}

async function refreshTokens(req: Request, res: Response, payload: JWTPayload) {
  const { accessToken, refreshToken } = await generateTokens(payload);

  await rotateRefreshToken(
    {
      refresh_token: refreshToken,
      user_id: payload.id,
      device: req.headers["user-agent"] ?? null,
    },
    req.cookies.refreshToken || req.body.refreshToken
  );
  res.setHeader("Authorization", accessToken);
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  handleValidToken(req, payload);
}

export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "LIBRARIAN") {
    next(new APIError(403, "Forbidden"));
  }
  next();
}
