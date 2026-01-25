
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { userSettingsService } from '@/lib/services/user-settings.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const settings = await userSettingsService.getSettings(userId);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const settings = await userSettingsService.updateSettings(userId, body);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
