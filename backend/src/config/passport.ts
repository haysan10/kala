import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { env } from "./env.js";
import { db } from "./database.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// ==================== GOOGLE OAUTH ====================
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    // Check if user exists with this Google ID
                    let user = await db.query.users.findFirst({
                        where: eq(users.providerId, profile.id),
                    });

                    const googleTokens = {
                        googleAccessToken: accessToken,
                        ...(refreshToken ? { googleRefreshToken: refreshToken } : {}),
                    };

                    if (!user) {
                        // Check if email already exists
                        const emailExists = await db.query.users.findFirst({
                            where: eq(users.email, profile.emails?.[0]?.value || ""),
                        });

                        if (emailExists) {
                            const [updated] = await db
                                .update(users)
                                .set({
                                    provider: "google",
                                    providerId: profile.id,
                                    avatar: profile.photos?.[0]?.value,
                                    ...googleTokens,
                                })
                                .where(eq(users.id, emailExists.id))
                                .returning();

                            return done(null, updated);
                        }

                        // Create new user
                        const [newUser] = await db
                            .insert(users)
                            .values({
                                email: profile.emails?.[0]?.value || "",
                                name: profile.displayName || "Google User",
                                provider: "google",
                                providerId: profile.id,
                                avatar: profile.photos?.[0]?.value,
                                passwordHash: null,
                                ...googleTokens,
                            })
                            .returning();

                        user = newUser;
                    } else {
                        // Update existing user with new tokens
                        const [updated] = await db
                            .update(users)
                            .set(googleTokens)
                            .where(eq(users.id, user.id))
                            .returning();
                        user = updated;
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
    console.log("✅ Google OAuth Strategy configured");
} else {
    console.log("⚠️  Google OAuth not configured (missing env variables)");
}

// ==================== GITHUB OAUTH ====================
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.GITHUB_CALLBACK_URL) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
                callbackURL: env.GITHUB_CALLBACK_URL,
                scope: ["user:email"],
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    // Check if user exists with this GitHub ID
                    let user = await db.query.users.findFirst({
                        where: eq(users.providerId, profile.id),
                    });

                    if (!user) {
                        // Get primary email from GitHub
                        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

                        // Check if email already exists
                        const emailExists = await db.query.users.findFirst({
                            where: eq(users.email, email),
                        });

                        if (emailExists) {
                            // Link GitHub account to existing email account
                            const [updated] = await db
                                .update(users)
                                .set({
                                    provider: "github",
                                    providerId: profile.id,
                                    avatar: profile.photos?.[0]?.value,
                                })
                                .where(eq(users.id, emailExists.id))
                                .returning();

                            return done(null, updated);
                        }

                        // Create new user
                        const [newUser] = await db
                            .insert(users)
                            .values({
                                email,
                                name: profile.displayName || profile.username || "GitHub User",
                                provider: "github",
                                providerId: profile.id,
                                avatar: profile.photos?.[0]?.value,
                                passwordHash: null, // OAuth users don't need password
                            })
                            .returning();

                        user = newUser;
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
    console.log("✅ GitHub OAuth Strategy configured");
} else {
    console.log("⚠️  GitHub OAuth not configured (missing env variables)");
}

export default passport;
