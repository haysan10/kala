
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { coursesService } from '@/lib/services/courses.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const reorderSchema = z.object({
  courseIds: z.array(z.string().uuid()),
});

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await coursesService.reorder(userId, parsed.data.courseIds);
    return NextResponse.json({ success: true, data: { message: 'Courses reordered successfully' } });
  } catch (error: any) {
    console.error('Courses Reorder POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
