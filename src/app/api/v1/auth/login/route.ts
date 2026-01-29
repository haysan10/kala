import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function GET() {
  return NextResponse.json({ success: true, message: 'Login endpoint active', timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Lazy import to avoid module initialization crashes
    const { authService } = await import('@/lib/services/auth.service');
    const result = await authService.login(parsed.data);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Login POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Login failed',
    }, { status: 401 });
  }
}
