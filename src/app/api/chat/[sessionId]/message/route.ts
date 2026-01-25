
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { chatService } from '@/lib/services/chat.service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { message } = body;

    const result = await chatService.sendMessage(params.sessionId, userId, message);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Chat Message POST error:', error);
    if (error.message === 'Chat session not found') {
        return NextResponse.json({ success: false, error: 'Chat session not found' }, { status: 404 });
    } else if (error.message === 'Message is required') {
        return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    } else if (error.message.includes('No AI API key')) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
