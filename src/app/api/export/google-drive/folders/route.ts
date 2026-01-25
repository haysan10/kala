
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { googleDriveService } from '@/lib/services/googleDrive.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');

  try {
    await googleDriveService.setCredentials(userId);
    const folders = await googleDriveService.listFolders(parentId || undefined);
    return NextResponse.json({ success: true, data: folders });
  } catch (error: any) {
    console.error('Google Drive Folders GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
