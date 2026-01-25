
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { blocksService } from '@/lib/services/blocks.service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { blockIds } = body;
    await blocksService.reorderBlocks(params.assignmentId, userId, blockIds);
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error: any) {
    console.error('Blocks Reorder POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
