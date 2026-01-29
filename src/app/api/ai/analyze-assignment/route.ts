
import { NextResponse } from 'next/server';
import { getAuthUserId } from '../../../../lib/helpers/auth';
import { getAIConfig } from '../../../../lib/helpers/ai-config';
import { aiRouter, AIRouterService } from '../../../../lib/services/ai-router.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
     const body = await request.json();
     const { text, fileData } = body;

     // Basic validation
     if (!text && !fileData) {
         return NextResponse.json({ success: false, error: 'Either text or fileData is required' }, { status: 400 });
     }

     const config = await getAIConfig(userId);
     
     if (!AIRouterService.hasValidConfig(config)) {
         // Di App Router, kita bisa return custom error object yang frontend bisa tangkap
         return NextResponse.json({ success: false, error: 'No AI API Key configured. Please add an API key in Settings.' }, { status: 400 });
     }

     const result = await aiRouter.analyzeAssignment(text, fileData, config);
     return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
     console.error('Analyze Assignment Error:', error);
     return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
