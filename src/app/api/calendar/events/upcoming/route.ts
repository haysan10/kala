
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { calendarService } from '@/lib/services/calendar.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');

  try {
    const events = await calendarService.getUpcomingEvents(userId, limit);
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Upcoming Events GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
