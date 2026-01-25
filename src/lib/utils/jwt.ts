import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JWTPayload {
    userId: string;
    email: string;
}

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "7d",
    } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}
