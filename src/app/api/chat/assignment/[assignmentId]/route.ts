
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { chatService } from '@/lib/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await chatService.getOrCreateSession(params.assignmentId, userId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Chat Session GET error:', error);
    if (error.message === 'Assignment not found') {
        return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
