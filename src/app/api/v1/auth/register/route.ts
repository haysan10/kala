import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function GET() {
  return NextResponse.json({ success: true, message: 'Register endpoint active', timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Lazy import to avoid module initialization crashes
    const { authService } = await import('@/lib/services/auth.service');
    const result = await authService.register(parsed.data);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('Register POST error:', error);
    
    // Handle specific errors
    if (error.message?.includes('already registered') || error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Registration failed',
    }, { status: 400 });
  }
}
