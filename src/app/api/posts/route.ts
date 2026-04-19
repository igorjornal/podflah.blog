import { NextRequest, NextResponse } from 'next/server';
import { db, posts, categories, authors } from '@/lib/db';
import { desc, eq, and, ilike, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify, calcReadTime } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q');
  const categorySlug = searchParams.get('category');
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(posts.status, status));
  if (q) conditions.push(ilike(posts.title, `%${q}%`));

  const query = db
    .select({
      post: posts,
      category: categories,
      author: authors,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(posts.updatedAt))
    .limit(limit)
    .offset(offset);

  const rows = await query;
  const data = rows.map(r => ({ ...r.post, category: r.category, author: r.author }));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const slug = body.slug || slugify(body.title || 'novo-post');
  const readTime = body.content ? calcReadTime(body.content) : '1 MIN';
  const wordCount = body.content ? body.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0;

  const [post] = await db.insert(posts).values({
    title: body.title || 'Sem título',
    slug,
    kicker: body.kicker,
    dek: body.dek,
    content: body.content || '',
    coverUrl: body.coverUrl,
    imgLabel: body.imgLabel,
    imgColor: body.imgColor || 'red',
    categoryId: body.categoryId ? parseInt(body.categoryId) : null,
    authorId: body.authorId ? parseInt(body.authorId) : null,
    status: body.status || 'draft',
    tags: body.tags,
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
    readTime,
    wordCount,
    pinned: body.pinned ?? false,
    featured: body.featured ?? false,
    allowComments: body.allowComments ?? true,
    sendNewsletter: body.sendNewsletter ?? false,
    publishedAt: body.status === 'published' ? new Date() : null,
  }).returning();

  return NextResponse.json(post, { status: 201 });
}
