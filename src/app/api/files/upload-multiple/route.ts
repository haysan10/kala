
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { storageService } from '@/lib/services/storage.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderId = formData.get('folderId') as string;
    const assignmentId = formData.get('assignmentId') as string;
    const type = formData.get('type') as string;

    if (!files || files.length === 0) {
        return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
        if (!(file instanceof File)) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const savedFile = await storageService.saveFile(
            buffer,
            file.name,
            file.type,
            {
                userId,
                folderId: folderId || null,
                assignmentId: assignmentId || null,
                type: type || 'draft'
            }
        );
        results.push(savedFile);
    }

    return NextResponse.json({ success: true, data: results }, { status: 201 });
  } catch (error: any) {
    console.error('File Upload Multiple POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
