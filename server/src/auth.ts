import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { Role, UserRecord } from "./types";
import { readUsers } from "./storage";

// Move this to environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export interface AuthRequest extends Request {
  user?: Omit<UserRecord, "passwordHash">;
}

// Improved JWT payload interface
interface JWTPayload extends JwtPayload {
  id: string;
  sub?: string;
  name?: string;
  admin?: boolean;
}

export function signJwt<T extends object>(
  payload: T,
  expiresIn: string | number = "2h"
): string {
  try {
    // Validate JWT_SECRET
    if (!JWT_SECRET || JWT_SECRET === "dev_secret_change_me") {
      console.warn("Using default JWT secret - not recommended for production");
    }

    // Add standard JWT claims to the payload
    const jwtPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000), // Issued at time
      sub: (payload as any).id || (payload as any).sub, // Subject (user ID)
    };

    const options = {
      expiresIn,
      algorithm: "HS256" as const,
      issuer: "upasthiti",
    } satisfies SignOptions;

    const token = jwt.sign(jwtPayload, JWT_SECRET, options);
    
    if (!token) {
      throw new Error("Failed to generate JWT token");
    }
    
    return token;
  } catch (error) {
    // Better error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`JWT signing error: ${errorMessage}`);
    throw new Error(`Error signing JWT: ${errorMessage}`);
  }
}



export function verifyJwt<T extends object>(token: string): T | null {
  try {
    if (!token || token.trim() === "") {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"], // Specify allowed algorithms for security
      issuer: "upasthiti", // Verify issuer matches
    }) as T;

    return decoded;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`JWT verification failed: ${errorMessage}`);
    return null;
  }
}

export function hashPassword(plain: string): string {
  try {
    if (!plain || plain.trim() === "") {
      throw new Error("Password cannot be empty");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plain, salt);
    
    if (!hash) {
      throw new Error("Failed to generate password hash");
    }
    
    return hash;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Password hashing error: ${errorMessage}`);
    throw new Error(`Password hashing failed: ${errorMessage}`);
  }
}

export function comparePassword(plain: string, hash: string): boolean {
  try {
    if (!plain || !hash) {
      return false;
    }
    
    return bcrypt.compareSync(plain, hash);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Password comparison failed: ${errorMessage}`);
    return false;
  }
}

export function requireAuth(allowedRoles?: Role[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = req.headers.authorization;
      
      if (!auth?.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Missing or invalid authorization header" });
      }

      const token = auth.slice(7);
      
      if (!token || token.trim() === "") {
        return res.status(401).json({ error: "Token is required" });
      }

      const payload = verifyJwt<JWTPayload>(token);

      if (!payload || !payload.id) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const users = await readUsers();
      const user = users.find((u) => u.id === payload.id);

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const { passwordHash, ...publicUser } = user;

      if (allowedRoles && !allowedRoles.includes(publicUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.user = publicUser;
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Authentication error: ${errorMessage}`);
      return res
        .status(500)
        .json({
          error: "Internal server error during authentication",
        });
    }
  };
}