import { NextRequest, NextResponse } from 'next/server';
import { db, authors } from '@/lib/db';
import { eq } from 'drizzle-orm';

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const body = await req.json();
  const { name, role, bio, instagram, youtube, avatarUrl } = body;
  await db.update(authors).set({ name, role, bio, instagram, youtube, avatarUrl }).where(eq(authors.id, id));
  return NextResponse.json({ ok: true });
}
