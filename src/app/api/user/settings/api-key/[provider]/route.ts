
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { userSettingsService } from '@/lib/services/user-settings.service';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await userSettingsService.deleteApiKey(userId, params.provider);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API Key DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
