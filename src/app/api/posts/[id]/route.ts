import { NextRequest, NextResponse } from 'next/server';
import { db, posts, postRevisions } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify, calcReadTime } from '@/lib/utils';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) { updates.title = body.title; if (!body.slug) updates.slug = slugify(body.title); }
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.kicker !== undefined) updates.kicker = body.kicker;
  if (body.dek !== undefined) updates.dek = body.dek;
  if (body.content !== undefined) {
    updates.content = body.content;
    updates.readTime = calcReadTime(body.content);
    updates.wordCount = body.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  }
  if (body.coverUrl !== undefined) updates.coverUrl = body.coverUrl;
  if (body.imgLabel !== undefined) updates.imgLabel = body.imgLabel;
  if (body.imgColor !== undefined) updates.imgColor = body.imgColor;
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId ? parseInt(body.categoryId) : null;
  if (body.authorId !== undefined) updates.authorId = body.authorId ? parseInt(body.authorId) : null;
  if (body.status !== undefined) {
    updates.status = body.status;
    if (body.status === 'published') updates.publishedAt = new Date();
  }
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.metaTitle !== undefined) updates.metaTitle = body.metaTitle;
  if (body.metaDescription !== undefined) updates.metaDescription = body.metaDescription;
  if (body.pinned !== undefined) updates.pinned = body.pinned;
  if (body.featured !== undefined) updates.featured = body.featured;
  if (body.allowComments !== undefined) updates.allowComments = body.allowComments;
  if (body.sendNewsletter !== undefined) updates.sendNewsletter = body.sendNewsletter;

  const [post] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.content && body.saveRevision) {
    const revisions = await db.select().from(postRevisions).where(eq(postRevisions.postId, id));
    await db.insert(postRevisions).values({
      postId: id,
      content: body.content,
      title: post.title,
      version: revisions.length + 1,
      label: body.revisionLabel || 'auto',
    });
  }

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  await db.delete(posts).where(eq(posts.id, id));
  return NextResponse.json({ ok: true });
}
