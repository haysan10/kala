import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        provider: string | null;
        providerId: string | null;
        avatar: string | null;
        createdAt: string;
        updatedAt: string;
      };
    }
  }
}

export {};
