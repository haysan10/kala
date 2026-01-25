import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_CALLBACK_URL) {
      return NextResponse.json(
        { success: false, error: 'GitHub OAuth is not configured' },
        { status: 500 }
      );
    }

    // Build the GitHub OAuth authorization URL
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    
    authUrl.searchParams.append('client_id', env.GITHUB_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', env.GITHUB_CALLBACK_URL);
    authUrl.searchParams.append('scope', 'user:email read:user');

    // Redirect to GitHub OAuth page
    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('GitHub OAuth initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate GitHub OAuth' },
      { status: 500 }
    );
  }
}
