
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { assignmentsService } from '@/lib/services/assignments.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
     const data = await assignmentsService.getAll(userId);
     return NextResponse.json({ success: true, data });
  } catch (error: any) {
     console.error('Assignments GET error:', error);
     return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
     const body = await request.json();
     const data = await assignmentsService.create(userId, body);
     return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
     console.error('Assignments POST error:', error);
     return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
