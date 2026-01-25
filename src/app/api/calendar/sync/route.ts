
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { calendarService } from '@/lib/services/calendar.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await calendarService.syncUserEvents(userId);
    return NextResponse.json({ 
        success: true, 
        data: result, 
        message: `Synced ${result.assignmentEvents} assignment events and ${result.milestoneEvents} milestone events` 
    });
  } catch (error: any) {
    console.error('Calendar Sync POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
