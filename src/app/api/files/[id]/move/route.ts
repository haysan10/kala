
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { storageService } from '@/lib/services/storage.service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const file = await storageService.getFile(params.id);
    if (!file) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    if (file.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { folderId } = body;

    const updated = await storageService.updateFile(params.id, {
        folderId: folderId || null
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('File Move POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
