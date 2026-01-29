
import { NextResponse } from 'next/server';
import { db } from '@/lib/config/database';
import { users, userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '@/lib/utils/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const demoEmail = 'demo@kala.ai';
    const demoName = 'Demo User';
    
    // API Keys provided via environment variables for security
    const geminiKey = process.env.DEMO_GEMINI_API_KEY;
    const grokKey = process.env.DEMO_GROK_API_KEY;

    if (!geminiKey || !grokKey) {
      console.error('Demo keys missing in environment variables');
    }

    // 1. Find or Create Demo User
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, demoEmail))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          email: demoEmail,
          name: demoName,
          provider: 'email',
        })
        .returning();
    }

    // 2. Ensure User Settings with API Keys exist
    let [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    if (!settings) {
      await db
        .insert(userSettings)
        .values({
          userId: user.id,
          geminiApiKey: geminiKey,
          grokApiKey: grokKey,
          aiProvider: 'gemini',
        });
    } else {
      // Update keys if they changed or were missing
      await db
        .update(userSettings)
        .set({
          geminiApiKey: geminiKey,
          grokApiKey: grokKey,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, user.id));
    }

    // 3. Sign Token
    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error: any) {
    console.error('Demo auth error:', error);
    return NextResponse.json({ success: false, error: 'Failed to initialize demo session' }, { status: 500 });
  }
}
