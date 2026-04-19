import { NextRequest, NextResponse } from 'next/server';
import { db, siteSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value ?? '';
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>;
  for (const [key, value] of Object.entries(body)) {
    await db.insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  }
  return NextResponse.json({ ok: true });
}
