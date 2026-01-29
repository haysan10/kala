import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as jose from 'jose';

export const dynamic = 'force-dynamic';

async function getAuthUserId(): Promise<string | null> {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return null;
    }
    
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy import to avoid module initialization crashes
    const { authService } = await import('@/lib/services/auth.service');
    const user = await authService.getProfile(userId);
    
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Me GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to get user profile',
    }, { status: 500 });
  }
}
