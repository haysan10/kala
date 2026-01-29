import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Lazy import to test database
        const { getDb } = await import('@/lib/config/database');
        const { users } = await import('@/lib/db/schema');
        
        const db = getDb();
        const result = await db.select({ id: users.id, email: users.email }).from(users).limit(3);
        
        return NextResponse.json({ 
            success: true, 
            userCount: result.length,
            users: result 
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            stack: error.stack?.substring(0, 500)
        }, { status: 500 });
    }
}
