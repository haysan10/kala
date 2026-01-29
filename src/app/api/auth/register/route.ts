
import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📝 Register Attempt:', { email: body.email, name: body.name, passwordLength: body.password?.length });
    
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.error('❌ Validation Failed:', parsed.error.errors);
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await authService.register(parsed.data);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('Register POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
