
import { NextResponse } from 'next/server';
import { coursesService } from '@/lib/services/courses.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Public or Auth generic endpoint
  try {
    const suggestions = coursesService.getIconSuggestions();
    return NextResponse.json({ success: true, data: suggestions });
  } catch (error: any) {
    console.error('Course Icons GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
