
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { storageService } from '@/lib/services/storage.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const allFiles = await storageService.getUserFiles(userId);
    const usedBytes = allFiles.reduce((sum, file) => sum + (file.sizeBytes || 0), 0);

    const limitBytes = 50 * 1024 * 1024; // 50MB
    const usedPercentage = Math.round((usedBytes / limitBytes) * 100);

    return NextResponse.json({ 
        success: true, 
        data: {
            usedBytes,
            limitBytes,
            usedPercentage: Math.min(usedPercentage, 100),
            fileCount: allFiles.length,
            isNearLimit: usedPercentage >= 80,
            isAtLimit: usedPercentage >= 100,
        }
    });
  } catch (error: any) {
    console.error('Storage Usage GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
