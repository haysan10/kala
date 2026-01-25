
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { coursesService } from '@/lib/services/courses.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(100).optional(),
  code: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  icon: z.string().max(10).optional(),
  semester: z.string().max(50).optional(),
  instructor: z.string().max(100).optional(),
  credits: z.number().int().min(1).max(10).optional(),
  isArchived: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  coverImage: z.string().url().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const course = await coursesService.getById(params.id, userId);
    if (!course) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    console.error('Course GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const course = await coursesService.update(params.id, userId, parsed.data);
    if (!course) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    console.error('Course PUT error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const deleted = await coursesService.delete(params.id, userId);
    if (!deleted) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { message: 'Course deleted successfully' } });
  } catch (error: any) {
    console.error('Course DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
