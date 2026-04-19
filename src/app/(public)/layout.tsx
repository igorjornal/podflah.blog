import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsTicker from '@/components/layout/NewsTicker';
import { db } from '@/lib/db';
import { posts, categories } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

async function getTickerPosts() {
  try {
    const latest = await db.select({
      title: posts.title,
      slug: posts.slug,
      categoryId: posts.categoryId,
    }).from(posts).where(eq(posts.status, 'published')).orderBy(desc(posts.publishedAt)).limit(8);

    const cats = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
    const catMap = Object.fromEntries(cats.map(c => [c.id, c.slug]));

    return latest.map(p => ({ title: p.title, slug: p.slug, categorySlug: catMap[p.categoryId ?? 0] ?? 'post' }));
  } catch {
    return [];
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tickerPosts = await getTickerPosts();

  return (
    <>
      <Header />
      <NewsTicker posts={tickerPosts} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
