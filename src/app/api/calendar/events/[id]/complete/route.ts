
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { calendarService } from '@/lib/services/calendar.service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const event = await calendarService.getEvent(params.id);
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    if (event.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const updated = await calendarService.completeEvent(params.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Calendar Event Complete POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
