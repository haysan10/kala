
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { googleDriveService } from '@/lib/services/googleDrive.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, content, folderId } = body;

    if (!title || !content) {
        return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    await googleDriveService.setCredentials(userId);

    let targetFolderId = folderId;
    if (!targetFolderId) {
        const kalaFolder = await googleDriveService.getOrCreateFolder('KALA');
        targetFolderId = kalaFolder.id;
    }

    const file = await googleDriveService.createMarkdownFile(title, content, targetFolderId);

    return NextResponse.json({ 
        success: true, 
        data: {
            message: 'Successfully exported to Google Drive',
            fileId: file.id,
            link: file.webViewLink
        } 
    });
  } catch (error: any) {
    console.error('Google Drive Export POST error:', error);
    const status = (error.message.includes('not connected') || error.message.includes('missing')) ? 401 : 500;
    const msg = status === 401 ? 'Please connect your Google Drive first.' : (error.message || 'Internal Server Error');
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
