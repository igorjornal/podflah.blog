import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { posts, categories } from '@/lib/db/schema';
import { desc, eq, and, or, ilike } from 'drizzle-orm';
import { type Post, type Category } from '@/lib/db/schema';
import ArchiveClient from './ArchiveClient';

export const metadata: Metadata = {
  title: 'Arquivo',
  description: 'Busque e navegue por todos os artigos publicados no PodFlah.blog.',
  openGraph: {
    title: 'Arquivo · PodFlah.blog',
    description: 'Toda a cobertura de futebol em um lugar só.',
    type: 'website',
  },
};

type SearchParams = {
  q?: string;
  cat?: string;
  sort?: string;
};

async function searchPosts(q: string, cat: string, sort: string): Promise<(Post & { category: Category | null })[]> {
  const conditions = [eq(posts.status, 'published')];

  if (cat) {
    // Find category by slug first
    const catRows = await db.select().from(categories).where(eq(categories.slug, cat)).limit(1);
    if (catRows[0]) {
      conditions.push(eq(posts.categoryId, catRows[0].id));
    }
  }

  if (q) {
    conditions.push(
      or(
        ilike(posts.title, `%${q}%`),
        ilike(posts.dek, `%${q}%`),
        ilike(posts.kicker, `%${q}%`),
        ilike(posts.tags, `%${q}%`),
      )!,
    );
  }

  const orderBy = sort === 'popular' ? desc(posts.viewCount) : desc(posts.publishedAt);

  const rows = await db
    .select()
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(100);

  return rows.map(r => ({ ...r.posts, category: r.categories ?? null }));
}

async function getAllCategories(): Promise<Category[]> {
  return db.select().from(categories);
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = '', cat = '', sort = 'recente' } = await searchParams;

  const [allPosts, allCategories] = await Promise.all([
    searchPosts(q, cat, sort),
    getAllCategories(),
  ]);

  return (
    <ArchiveClient
      initialPosts={allPosts}
      allCategories={allCategories}
      initialQ={q}
      initialCat={cat}
      initialSort={sort}
    />
  );
}
