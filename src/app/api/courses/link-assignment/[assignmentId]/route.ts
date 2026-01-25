
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { coursesService } from '@/lib/services/courses.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const linkAssignmentSchema = z.object({
    courseId: z.string().uuid().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = linkAssignmentSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const success = await coursesService.linkAssignment(
        params.assignmentId,
        parsed.data.courseId || null,
        userId
    );

    if (!success) {
        return NextResponse.json({ success: false, error: 'Assignment or course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { message: 'Assignment linked successfully' } });
  } catch (error: any) {
    console.error('Course Link Assignment POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
