
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { milestonesService } from '@/lib/services/milestones.service';
import { updateMilestoneSchema } from '@/lib/types'; // Schema exists in index.ts
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Validate body if needed, or pass directly. 
    // milestonesService.update handles partial updates.
    
    // Optional: Zod validation
    // const validated = updateMilestoneSchema.parse(body);
    
    const result = await milestonesService.update(params.id, userId, body);
    return NextResponse.json({ success: true, data: result.milestone, assignmentProgress: result.assignmentProgress });
  } catch (error: any) {
    console.error('Milestone PUT error:', error);
    if (error.message === 'Milestone not found') {
        return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await milestonesService.delete(params.id, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Milestone DELETE error:', error);
    if (error.message === 'Milestone not found') {
        return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
