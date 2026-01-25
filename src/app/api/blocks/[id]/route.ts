
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { blocksService } from '@/lib/services/blocks.service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const block = await blocksService.updateBlock(params.id, userId, body);
    if (!block) return NextResponse.json({ success: false, error: 'Block not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: block });
  } catch (error: any) {
    console.error('Block PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const success = await blocksService.deleteBlock(params.id, userId);
    return NextResponse.json({ success: true, data: { success } });
  } catch (error: any) {
    console.error('Block DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
