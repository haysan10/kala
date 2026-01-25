
import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await authService.login(parsed.data);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Login POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}
