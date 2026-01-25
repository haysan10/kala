import { db } from "../config/database";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import type { RegisterInput, LoginInput, UpdateProfileInput } from "../types/index";

export class AuthService {
    async register(input: RegisterInput) {
        // Check if user exists
        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, input.email.toLowerCase()))
            .limit(1);

        if (existing) {
            throw new Error("Email already registered");
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Create user
        const [user] = await db
            .insert(users)
            .values({
                email: input.email.toLowerCase(),
                passwordHash,
                name: input.name,
            })
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
            });

        // Generate token
        const token = signToken({ userId: user.id, email: user.email });

        return { user, token };
    }

    async login(input: LoginInput) {
        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email.toLowerCase()))
            .limit(1);

        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Verify password
        if (!user.passwordHash) {
            throw new Error("Invalid email or password"); // Or a more specific message if desired
        }

        const valid = await comparePassword(input.password, user.passwordHash);
        if (!valid) {
            throw new Error("Invalid email or password");
        }

        // Generate token
        const token = signToken({ userId: user.id, email: user.email });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async getProfile(userId: string) {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                provider: users.provider,
                avatar: users.avatar,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    async updateProfile(userId: string, input: UpdateProfileInput) {
        const updateData: Record<string, unknown> = {};

        if (input.name) updateData.name = input.name;
        // Settings are now in userSettings table, handled by a separate endpoint or service

        updateData.updatedAt = new Date().toISOString();

        const [updated] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
            });

        return updated;
    }
}

export const authService = new AuthService();
