
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { blocksService } from '@/lib/services/blocks.service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const blocks = await blocksService.getBlocksByAssignment(params.assignmentId, userId);
    return NextResponse.json({ success: true, data: blocks });
  } catch (error: any) {
    console.error('Blocks GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
