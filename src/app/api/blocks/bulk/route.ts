
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { blocksService } from '@/lib/services/blocks.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { assignmentId, blocks } = body;
    const createdBlocks = await blocksService.bulkCreateBlocks(assignmentId, userId, blocks);
    return NextResponse.json({ success: true, data: createdBlocks }, { status: 201 });
  } catch (error: any) {
    console.error('Blocks Bulk Create POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
