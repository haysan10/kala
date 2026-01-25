
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
    const result = await storageService.getFileContent(params.id);
    if (!result) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    
    if (result.metadata.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const headers = new Headers();
    headers.set('Content-Type', result.metadata.mimeType || 'application/octet-stream');
    // Inline disposition
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(result.metadata.originalName || result.metadata.name)}"`);

    return new NextResponse(result.buffer as any, {
        status: 200,
        headers,
    });
  } catch (error: any) {
    console.error('File Preview GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
