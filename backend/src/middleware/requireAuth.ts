import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Ingen giltig inloggning",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: "USER" | "ADMIN";
    };

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      error: "Ogiltig eller utgången token",
    });
  }
}
