import jwt, { SignOptions, JwtPayload, VerifyOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { Role, UserRecord } from "./types";
import { readUsers } from "./storage";

// Move this to environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production environment");
}

export interface AuthRequest extends Request {
  user?: Omit<UserRecord, "passwordHash">;
}

interface JWTPayload extends JwtPayload {
  id: string;
  sub?: string;
  name?: string;
  admin?: boolean;
}

export function signJwt<T extends object>(
  payload: T & { id: string },
  expiresIn: string | number = "2h"
): string {
  try {
    if (!JWT_SECRET || JWT_SECRET === "dev_secret_change_me") {
      console.warn("Using default JWT secret - not recommended for production");
    }

    const jwtPayload: JWTPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      sub: payload.id,
    };

    const options: SignOptions = {
      expiresIn,
      algorithm: "HS256",
      issuer: "upasthiti",
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, options);
    if (!token) throw new Error("Failed to generate JWT token");
    return token;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`JWT signing error: ${errorMessage}`);
    throw new Error(`Error signing JWT: ${errorMessage}`);
  }
}

export function verifyJwt<T extends JWTPayload>(token: string): T | null {
  try {
    if (!token || token.trim() === "") return null;

    const options: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: "upasthiti",
    };

    const decoded = jwt.verify(token, JWT_SECRET, options) as T;
    if (!decoded || !("id" in decoded)) return null;
    return decoded;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`JWT verification failed: ${errorMessage}`);
    return null;
  }
}

export function hashPassword(plain: string): string {
  try {
    if (!plain || plain.trim() === "") throw new Error("Password cannot be empty");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plain, salt);
    if (!hash) throw new Error("Failed to generate password hash");
    return hash;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Password hashing error: ${errorMessage}`);
    throw new Error(`Password hashing failed: ${errorMessage}`);
  }
}

export function comparePassword(plain: string, hash: string): boolean {
  try {
    if (!plain || !hash) return false;
    return bcrypt.compareSync(plain, hash);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Password comparison failed: ${errorMessage}`);
    return false;
  }
}

export function requireAuth(allowedRoles?: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = req.headers.authorization;

      if (!auth || !auth.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Missing or invalid authorization header" });
      }

      const token = auth.slice(7).trim();
      if (!token) return res.status(401).json({ error: "Token is required" });

      const payload = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "upasthiti",
      }) as JWTPayload;

      if (!payload || !payload.id) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const users = readUsers() || [];
      const user = users.find((u) => u.id === payload.id);

      if (!user) return res.status(401).json({ error: "User not found" });

      const { passwordHash, ...publicUser } = user;

      if (allowedRoles && !allowedRoles.includes(publicUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.user = publicUser;
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Authentication error: ${errorMessage}`);
      return res.status(500).json({ error: "Internal server error during authentication" });
    }
  };
}