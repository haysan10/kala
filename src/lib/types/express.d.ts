import "express";

declare global {
  namespace Express {
    // Extend Express.User interface to include all user properties
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
  }
}

export {};
