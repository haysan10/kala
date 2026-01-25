
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { coursesService } from '@/lib/services/courses.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(100),
  code: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  icon: z.string().max(10).optional(),
  semester: z.string().max(50).optional(),
  instructor: z.string().max(100).optional(),
  credits: z.number().int().min(1).max(10).optional(),
});

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get('includeArchived') === 'true';

  try {
    const courses = await coursesService.getAll(userId, includeArchived);
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error('Courses GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const course = await coursesService.create(userId, parsed.data);
    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error: any) {
    console.error('Courses POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
