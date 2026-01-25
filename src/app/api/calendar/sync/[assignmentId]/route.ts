
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { calendarService } from '@/lib/services/calendar.service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const deadlineEvent = await calendarService.generateAssignmentDeadlineEvent(params.assignmentId, userId);
    const milestoneEvents = await calendarService.generateMilestoneEvents(params.assignmentId, userId);

    return NextResponse.json({ 
        success: true, 
        data: { deadlineEvent, milestoneEvents } 
    });
  } catch (error: any) {
    console.error('Calendar Assignment Sync POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
