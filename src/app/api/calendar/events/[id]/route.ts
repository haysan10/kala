
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { calendarService } from '@/lib/services/calendar.service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const event = await calendarService.getEvent(params.id);
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    if (event.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    console.error('Calendar Event GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const event = await calendarService.getEvent(params.id);
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    if (event.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const updated = await calendarService.updateEvent(params.id, body);
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Calendar Event PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const event = await calendarService.getEvent(params.id);
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    if (event.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await calendarService.deleteEvent(params.id);
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error: any) {
    console.error('Calendar Event DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
