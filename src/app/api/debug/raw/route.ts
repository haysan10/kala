import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client/web';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;
        
        // Debug: Check what env vars we're getting
        const debugInfo = {
            urlPresent: !!url,
            urlStart: url?.substring(0, 40),
            tokenPresent: !!authToken,
            tokenLength: authToken?.length,
        };
        
        if (!url) {
            return NextResponse.json({ 
                success: false, 
                error: 'TURSO_DATABASE_URL not set',
                debug: debugInfo
            }, { status: 500 });
        }
        
        const client = createClient({ url, authToken });
        
        // Test raw SQL query
        const result = await client.execute('SELECT id, email FROM users LIMIT 3');
        
        return NextResponse.json({ 
            success: true, 
            userCount: result.rows.length,
            users: result.rows,
            debug: debugInfo
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            code: error.code,
        }, { status: 500 });
    }
}
