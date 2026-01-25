
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { getAIConfig } from '@/lib/helpers/ai-config';
import { aiRouter, AIRouterService } from '@/lib/services/ai-router.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
     const body = await request.json();
     const { assignmentContext } = body;

     const config = await getAIConfig(userId);
     if (!AIRouterService.hasValidConfig(config)) {
         return NextResponse.json({ success: false, error: 'No AI API Key configured' }, { status: 400 });
     }

     const result = await aiRouter.generateScaffoldingTask(assignmentContext, config);
     return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
     console.error('Scaffold Error:', error);
     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
