import { NextRequest, NextResponse } from 'next/server';
import { db, categories } from '@/lib/db';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  const data = await db.select().from(categories);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const slug = body.slug || slugify(body.name);

  const [cat] = await db.insert(categories).values({
    name: body.name,
    slug,
    description: body.description,
    color: body.color || 'yellow',
  }).returning();

  return NextResponse.json(cat, { status: 201 });
}
