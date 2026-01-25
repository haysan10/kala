
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { calendarService } from '@/lib/services/calendar.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const range = start && end ? { start, end } : undefined;

  try {
    const events = await calendarService.getEvents(userId, range);
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Calendar Events GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, description, startTime, endTime, allDay, type, color, assignmentId, milestoneId, courseId } = body;

    if (!title?.trim()) {
        return NextResponse.json({ success: false, error: 'Event title is required' }, { status: 400 });
    }
    if (!startTime) {
        return NextResponse.json({ success: false, error: 'Start time is required' }, { status: 400 });
    }

    const event = await calendarService.createEvent({
        userId,
        title: title.trim(),
        description,
        startTime,
        endTime,
        allDay,
        type,
        color,
        assignmentId,
        milestoneId,
        courseId
    });
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    console.error('Calendar Events POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
