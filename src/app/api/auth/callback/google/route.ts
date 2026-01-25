import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';
import { db } from '@/lib/config/database';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '@/lib/utils/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL(`/?error=oauth_${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=oauth_no_code', request.url));
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: env.GOOGLE_CALLBACK_URL!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/?error=oauth_token_failed', request.url));
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token } = tokens;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch Google user info');
      return NextResponse.redirect(new URL('/?error=oauth_userinfo_failed', request.url));
    }

    const googleUser = await userInfoResponse.json();
    const { id: providerId, email, name, picture } = googleUser;

    // Check if user exists with this Google ID
    let user = await db.query.users.findFirst({
      where: eq(users.providerId, providerId),
    });

    const googleTokens = {
      googleAccessToken: access_token,
      ...(refresh_token ? { googleRefreshToken: refresh_token } : {}),
    };

    if (!user) {
      // Check if email already exists
      const emailExists = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (emailExists) {
        // Link Google account to existing email account
        const [updated] = await db
          .update(users)
          .set({
            provider: 'google',
            providerId,
            avatar: picture,
            ...googleTokens,
          })
          .where(eq(users.id, emailExists.id))
          .returning();

        user = updated;
      } else {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            name: name || 'Google User',
            provider: 'google',
            providerId,
            avatar: picture,
            passwordHash: null,
            ...googleTokens,
          })
          .returning();

        user = newUser;
      }
    } else {
      // Update existing user with new tokens
      const [updated] = await db
        .update(users)
        .set(googleTokens)
        .where(eq(users.id, user.id))
        .returning();
      user = updated;
    }

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // Redirect to home with token as cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_error', request.url));
  }
}
