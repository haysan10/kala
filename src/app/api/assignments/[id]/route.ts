
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { assignmentsService } from '@/lib/services/assignments.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
     const data = await assignmentsService.getById(params.id, userId);
     return NextResponse.json({ success: true, data });
  } catch (error: any) {
     if (error.message === 'Assignment not found') {
         return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
     }
     return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  
    try {
       const body = await request.json();
       const data = await assignmentsService.update(params.id, userId, body);
       return NextResponse.json({ success: true, data });
    } catch (error: any) {
       if (error.message === 'Assignment not found') return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  
    try {
       await assignmentsService.delete(params.id, userId);
       return NextResponse.json({ success: true, deleted: true });
    } catch (error: any) {
       if (error.message === 'Assignment not found') return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
