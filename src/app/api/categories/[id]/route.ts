import { NextRequest, NextResponse } from 'next/server';
import { db, categories } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name) { updates.name = body.name; if (!body.slug) updates.slug = slugify(body.name); }
  if (body.slug) updates.slug = body.slug;
  if (body.description !== undefined) updates.description = body.description;
  if (body.color) updates.color = body.color;

  const [cat] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
  return NextResponse.json(cat);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(categories).where(eq(categories.id, parseInt(params.id)));
  return NextResponse.json({ ok: true });
}
