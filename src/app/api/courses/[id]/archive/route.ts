
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { coursesService } from '@/lib/services/courses.service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const course = await coursesService.toggleArchive(params.id, userId);
    if (!course) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    console.error('Course Archive POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
