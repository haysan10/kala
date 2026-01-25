
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { userSettingsService } from '@/lib/services/user-settings.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { provider, apiKey } = body;
    
    if (!provider || !apiKey) {
         return NextResponse.json({ success: false, error: 'Provider and API key required' }, { status: 400 });
    }

    const result = await userSettingsService.validateApiKey(provider, apiKey);
    if (result.valid) {
        return NextResponse.json({ success: true, data: result });
    } else {
        return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Validate API Key POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
