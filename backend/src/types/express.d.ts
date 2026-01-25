import "express";

// Define User interface matching the database schema
// This avoids circular dependency issues with drizzle-orm types
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  provider: string | null;
  providerId: string | null;
  avatar: string | null;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
