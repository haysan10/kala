
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { storageService } from '@/lib/services/storage.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  try {
    const files = await storageService.getUserFiles(
        userId,
        folderId === 'null' ? null : folderId || undefined
    );
    return NextResponse.json({ success: true, data: files });
  } catch (error: any) {
    console.error('Files GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
