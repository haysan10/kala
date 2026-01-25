
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
    const file = await storageService.getFile(params.id);
    if (!file) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    if (file.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ success: true, data: file });
  } catch (error: any) {
    console.error('File GET error:', error);
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
    const file = await storageService.getFile(params.id);
    if (!file) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    if (file.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const updated = await storageService.updateFile(params.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('File PATCH error:', error);
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
    const file = await storageService.getFile(params.id);
    if (!file) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    if (file.userId !== userId) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await storageService.deleteFile(params.id);
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error: any) {
    console.error('File DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
