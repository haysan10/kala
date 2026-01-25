import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
      return NextResponse.json(
        { success: false, error: 'Google OAuth is not configured' },
        { status: 500 }
      );
    }

    // Build the Google OAuth authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    authUrl.searchParams.append('client_id', env.GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', env.GOOGLE_CALLBACK_URL);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');

    // Redirect to Google OAuth page
    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
