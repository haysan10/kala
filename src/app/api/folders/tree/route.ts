
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { storageService } from '@/lib/services/storage.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const allFolders = await storageService.getUserFolders(userId);
    
    const buildTree = (parentId: string | null): any[] => {
        return allFolders
            .filter(f => f.parentId === parentId)
            .map(folder => ({
                ...folder,
                children: buildTree(folder.id),
            }));
    };

    const tree = buildTree(null);
    return NextResponse.json({ success: true, data: tree });
  } catch (error: any) {
    console.error('Folder Tree GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
