import { NextRequest, NextResponse } from 'next/server';
import { db, posts } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

type Params = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  await db.update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, id));

  return NextResponse.json({ ok: true });
}
