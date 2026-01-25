
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
    const folder = await storageService.getFolder(params.id);
    if (!folder) return NextResponse.json({ success: false, error: 'Folder not found' }, { status: 404 });
    if (folder.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const subfolders = await storageService.getUserFolders(userId, folder.id);
    const files = await storageService.getUserFiles(userId, folder.id);

    return NextResponse.json({ 
        success: true, 
        data: { ...folder, subfolders, files } 
    });
  } catch (error: any) {
    console.error('Folder GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { name, color, icon, parentId, isStarred } = body;

    if (parentId === params.id) {
        return NextResponse.json({ success: false, error: 'Cannot move folder to itself' }, { status: 400 });
    }

    const updated = await storageService.updateFolder(params.id, {
        name, color, icon, parentId, isStarred
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Folder PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const folder = await storageService.getFolder(params.id);
    if (!folder) return NextResponse.json({ success: false, error: 'Folder not found' }, { status: 404 });
    if (folder.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await storageService.deleteFolder(params.id);
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error: any) {
    console.error('Folder DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
