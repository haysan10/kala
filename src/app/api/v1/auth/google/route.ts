import { NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Check if Google OAuth is configured
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return NextResponse.json(
      { success: false, error: 'Google OAuth is not configured. Please set environment variables.' },
      { status: 500 }
    );
  }

  const callbackUrl = env.GOOGLE_CALLBACK_URL || `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/v1/auth/callback/google`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(googleAuthUrl.toString());
}
