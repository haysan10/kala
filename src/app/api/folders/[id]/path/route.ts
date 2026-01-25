
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { storageService } from '@/lib/services/storage.service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const path: Array<{ id: string; name: string }> = [];
    let currentId: string | null = params.id;

    while (currentId) {
        const folder = await storageService.getFolder(currentId);
        if (!folder || folder.userId !== userId) break;

        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
    }

    return NextResponse.json({ success: true, data: path });
  } catch (error: any) {
    console.error('Folder Path GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
