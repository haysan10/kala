
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { milestonesService } from '@/lib/services/milestones.service';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await milestonesService.toggle(params.id, userId);
    return NextResponse.json({ success: true, data: result.milestone, assignmentProgress: result.assignmentProgress });
  } catch (error: any) {
    console.error('Milestone Toggle PUT error:', error);
    if (error.message === 'Milestone not found') {
        return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
