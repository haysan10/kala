
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/helpers/auth';
import { synapseService } from '@/lib/services/synapse.service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { response } = body;
    
    if (!response) {
         return NextResponse.json({ success: false, error: 'Response is required' }, { status: 400 });
    }

    const updated = await synapseService.completeSynapse(params.id, userId, response);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Synapse Complete POST error:', error);
    if (error.message === 'Synapse not found') {
        return NextResponse.json({ success: false, error: 'Synapse not found' }, { status: 404 });
    } else if (error.message === 'Synapse already completed') {
        return NextResponse.json({ success: false, error: 'Synapse already completed' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
