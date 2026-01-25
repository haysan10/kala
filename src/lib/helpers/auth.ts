import { headers } from 'next/headers';
import * as jose from 'jose';
import { env } from '@/lib/config/env';

export async function getAuthUserId(): Promise<string | null> {
  const headersList = headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}
