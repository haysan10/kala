
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
    const folder = await storageService.getFolder(params.id);
    if (!folder) return NextResponse.json({ success: false, error: 'Folder not found' }, { status: 404 });
    if (folder.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { parentId } = body;

    if (parentId === params.id) {
        return NextResponse.json({ success: false, error: 'Cannot move folder to itself' }, { status: 400 });
    }

    if (parentId) {
        const parent = await storageService.getFolder(parentId);
        if (!parent || parent.userId !== userId) {
            return NextResponse.json({ success: false, error: 'Invalid destination folder' }, { status: 400 });
        }
    }

    const updated = await storageService.updateFolder(params.id, {
        parentId: parentId || null
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Folder Move POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
