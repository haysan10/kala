
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { storageService } from '@/lib/services/storage.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');

  try {
    const folders = await storageService.getUserFolders(
        userId, 
        parentId === 'null' ? null : parentId || undefined
    );
    return NextResponse.json({ success: true, data: folders });
  } catch (error: any) {
    console.error('Folders GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, parentId, color, icon, assignmentId, courseId } = body;

    if (!name?.trim()) {
        return NextResponse.json({ success: false, error: 'Folder name is required' }, { status: 400 });
    }

    if (parentId) {
        const parent = await storageService.getFolder(parentId);
        if (!parent || parent.userId !== userId) {
            return NextResponse.json({ success: false, error: 'Invalid parent folder' }, { status: 400 });
        }
    }

    const folder = await storageService.createFolder({
        userId,
        name: name.trim(),
        parentId: parentId || null,
        color,
        icon,
        assignmentId,
        courseId
    });
    return NextResponse.json({ success: true, data: folder }, { status: 201 });
  } catch (error: any) {
    console.error('Folders POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
