import { NextRequest, NextResponse } from 'next/server';
import { db, posts, categories, authors } from '@/lib/db';
import { eq, and, ilike, desc, or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const categoryId = searchParams.get('category');
  const sort = searchParams.get('sort') ?? 'recent';

  const conditions = [eq(posts.status, 'published')];

  if (q.length > 0) {
    conditions.push(
      or(
        ilike(posts.title, `%${q}%`),
        ilike(posts.dek, `%${q}%`),
        ilike(posts.kicker, `%${q}%`)
      )!
    );
  }

  if (categoryId) conditions.push(eq(posts.categoryId, parseInt(categoryId)));

  const orderCol = sort === 'views' ? desc(posts.viewCount) : desc(posts.publishedAt);

  const rows = await db
    .select({ post: posts, category: categories, author: authors })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(...conditions))
    .orderBy(orderCol)
    .limit(50);

  return NextResponse.json(rows.map(r => ({ ...r.post, category: r.category, author: r.author })));
}
