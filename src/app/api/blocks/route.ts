
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { blocksService } from '@/lib/services/blocks.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const block = await blocksService.createBlock({
        ...body,
        userId
    });
    return NextResponse.json({ success: true, data: block }, { status: 201 });
  } catch (error: any) {
    console.error('Blocks Create POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
