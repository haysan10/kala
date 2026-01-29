
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
     const { milestoneTitle, milestoneDescription, assignmentContext, fullRoadmap } = body;
     
     if (!milestoneTitle || !milestoneDescription) {
        return NextResponse.json({ success: false, error: 'Milestone Title and Description required' }, { status: 400 });
     }

     const config = await getAIConfig(userId);
     if (!AIRouterService.hasValidConfig(config)) {
         return NextResponse.json({ success: false, error: 'No AI API Key configured' }, { status: 400 });
     }

     const result = await aiRouter.generateMiniCourse(
        milestoneTitle, 
        milestoneDescription, 
        assignmentContext, 
        fullRoadmap, 
        config
     );
     return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
     console.error('MiniCourse Error:', error);
     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
