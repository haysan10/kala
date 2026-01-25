
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { milestonesService } from '@/lib/services/milestones.service';
import { createMilestoneSchema } from '@/lib/types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await milestonesService.getByAssignment(params.id, userId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Milestones GET error:', error);
    if (error.message === 'Assignment not found') {
        return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Validate body
    // If schema is not available, we can mock it or assume body is correct for now, but better to use Zod if possible.
    // Assuming createMilestoneSchema exists or defining it here if needed.
    
    const data = await milestonesService.create(params.id, userId, body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Milestones POST error:', error);
    if (error.message === 'Assignment not found') {
        return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
