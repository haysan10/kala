
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { chatService } from '@/lib/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const messages = await chatService.getHistory(params.sessionId, userId);
    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error('Chat History GET error:', error);
    if (error.message === 'Chat session not found') {
        return NextResponse.json({ success: false, error: 'Chat session not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
