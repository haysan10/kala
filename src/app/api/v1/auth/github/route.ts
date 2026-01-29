import { NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Check if GitHub OAuth is configured
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    console.error('GitHub OAuth not configured: missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
    return NextResponse.json(
      { success: false, error: 'GitHub OAuth is not configured. Please set environment variables.' },
      { status: 500 }
    );
  }

  const callbackUrl = env.GITHUB_CALLBACK_URL || `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/v1/auth/callback/github`;

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  githubAuthUrl.searchParams.set('scope', 'user:email');

  return NextResponse.redirect(githubAuthUrl.toString());
}
