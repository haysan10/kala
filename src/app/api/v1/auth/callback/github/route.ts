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
      console.error('GitHub OAuth error:', error);
      return NextResponse.redirect(new URL(`/?error=oauth_${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=oauth_no_code', request.url));
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID!,
        client_secret: env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('GitHub token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/?error=oauth_token_failed', request.url));
    }

    const tokens = await tokenResponse.json();
    const { access_token } = tokens;

    // Get user info from GitHub
    const userInfoResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch GitHub user info');
      return NextResponse.redirect(new URL('/?error=oauth_userinfo_failed', request.url));
    }

    const githubUser = await userInfoResponse.json();

    // Get user emails from GitHub
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    });

    let email = '';
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary);
      email = primaryEmail?.email || emails[0]?.email || `${githubUser.login}@github.local`;
    } else {
      email = `${githubUser.login}@github.local`;
    }

    const providerId = String(githubUser.id);
    const name = githubUser.name || githubUser.login || 'GitHub User';
    const avatar = githubUser.avatar_url;

    // Check if user exists with this GitHub ID
    let user = await db.query.users.findFirst({
      where: eq(users.providerId, providerId),
    });

    if (!user) {
      // Check if email already exists
      const emailExists = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (emailExists) {
        // Link GitHub account to existing email account
        const [updated] = await db
          .update(users)
          .set({
            provider: 'github',
            providerId,
            avatar,
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
            name,
            provider: 'github',
            providerId,
            avatar,
            passwordHash: null,
          })
          .returning();

        user = newUser;
      }
    }

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    // Redirect to home with token in query param (so MainApp can save it)
    const baseUrl = new URL('/', request.url);
    baseUrl.searchParams.set('token', token);
    
    return NextResponse.redirect(baseUrl);
  } catch (error: any) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_error', request.url));
  }
}
