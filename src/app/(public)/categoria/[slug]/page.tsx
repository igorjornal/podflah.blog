import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { posts, categories } from '@/lib/db/schema';
import { desc, eq, and, count } from 'drizzle-orm';
import { formatDateShort } from '@/lib/utils';
import styles from './CategoryPage.module.css';

type Params = { slug: string };
type SearchParams = { page?: string; sort?: string; q?: string };

const PAGE_SIZE = 12;

async function getCategory(slug: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

async function getAllCategories() {
  return db.select().from(categories);
}

async function getCategoryPosts(
  categoryId: number,
  page: number,
  sort: string,
  q: string,
) {
  const offset = (page - 1) * PAGE_SIZE;

  let query = db
    .select()
    .from(posts)
    .where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'published')));

  // Apply sort
  const ordered = sort === 'popular'
    ? query.orderBy(desc(posts.viewCount))
    : query.orderBy(desc(posts.publishedAt));

  const rows = await ordered.limit(PAGE_SIZE).offset(offset);

  // Count total (for pagination)
  const totalRows = await db
    .select({ total: count() })
    .from(posts)
    .where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'published')));

  const total = totalRows[0]?.total ?? 0;

  // Filter by search query if provided (client-side filter on result subset for simplicity)
  const filtered = q
    ? rows.filter(p =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        (p.dek ?? '').toLowerCase().includes(q.toLowerCase()),
      )
    : rows;

  return { posts: filtered, total: Number(total), pages: Math.ceil(Number(total) / PAGE_SIZE) };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Categoria não encontrada' };

  return {
    title: category.name,
    description: category.description ?? `Leia os melhores artigos de ${category.name} no PodFlah.`,
    openGraph: {
      title: `${category.name} · PodFlah.blog`,
      description: category.description ?? `Cobertura completa de ${category.name}.`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { page: pageParam, sort = 'recente', q = '' } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const category = await getCategory(slug);
  if (!category) notFound();

  const [allCategories, { posts: catPosts, total, pages }] = await Promise.all([
    getAllCategories(),
    getCategoryPosts(category.id, page, sort, q),
  ]);

  const featuredPost = catPosts.find(p => p.featured) ?? catPosts[0];
  const gridPosts = catPosts.filter(p => p.id !== featuredPost?.id);
  const chipClass = category.color === 'red' ? 'red' : category.color === 'black' ? 'black' : '';

  function buildHref(newPage: number) {
    const sp = new URLSearchParams();
    if (newPage > 1) sp.set('page', String(newPage));
    if (sort !== 'recente') sp.set('sort', sort);
    if (q) sp.set('q', q);
    const qs = sp.toString();
    return `/categoria/${slug}${qs ? '?' + qs : ''}`;
  }

  return (
    <div className={styles.page}>
      {/* ── HERO ── */}
      <div className={styles.heroSection}>
        <div className="wrap">
          <nav className="crumbs">
            <Link href="/">Blog</Link>
            <span className="sep">/</span>
            <span>{category.name}</span>
          </nav>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={`cat-chip ${chipClass}`}>{category.name}</span>
              <h1 className={styles.heroTitle}>
                Tudo sobre{' '}
                <em>{category.name}</em>
              </h1>
              {category.description && (
                <p className={styles.heroDesc}>{category.description}</p>
              )}
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{total}</span>
                <span className={styles.statLabel}>POSTS PUBLICADOS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY NAV TABS ── */}
      <div className={styles.catNav}>
        <div className="wrap">
          <div className={styles.catTabs}>
            <Link href="/" className={styles.catTab}>Todos</Link>
            {allCategories.map(c => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className={`${styles.catTab} ${c.slug === slug ? styles.catTabActive : ''}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="wrap">
        <form className={styles.filterBar} method="get">
          <div className={styles.filterLeft}>
            <label className={styles.filterLabel}>ORDENAR:</label>
            <select
              name="sort"
              defaultValue={sort}
              className={styles.filterSelect}
            >
              <option value="recente">Mais recentes</option>
              <option value="popular">Mais lidos</option>
            </select>
          </div>
          <div className={styles.filterRight}>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={`Buscar em ${category.name}…`}
              className={styles.filterSearch}
            />
            <button type="submit" className="btn btn-primary">
              BUSCAR
            </button>
          </div>
        </form>
      </div>

      {/* ── FEATURED POST (large card) ── */}
      {featuredPost && (
        <div className="wrap">
          <article className={styles.featuredCard}>
            <Link href={`/${category.slug}/${featuredPost.slug}`} className={styles.featuredImgWrap}>
              <div className={`${styles.featuredImg} ${featuredPost.imgColor === 'dark' ? styles.featuredImgDark : ''}`}>
                {featuredPost.coverUrl ? (
                  <img src={featuredPost.coverUrl} alt={featuredPost.title} />
                ) : (
                  <span className={styles.featuredImgLabel}>
                    {featuredPost.imgLabel || category.name.toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
            <div className={styles.featuredBody}>
              <div>
                <Link href={`/categoria/${category.slug}`} className={`cat-chip ${chipClass}`}>
                  {category.name}
                </Link>
                {featuredPost.kicker && (
                  <p className={styles.featuredKicker}>{featuredPost.kicker}</p>
                )}
                <h2 className={styles.featuredTitle}>
                  <Link href={`/${category.slug}/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h2>
                {featuredPost.dek && (
                  <p className={styles.featuredDek}>{featuredPost.dek}</p>
                )}
              </div>
              <div className={styles.featuredFooter}>
                <div className={styles.featuredMeta}>
                  {featuredPost.publishedAt && (
                    <span>{formatDateShort(featuredPost.publishedAt)}</span>
                  )}
                  {featuredPost.readTime && <span>{featuredPost.readTime}</span>}
                  {featuredPost.viewCount != null && featuredPost.viewCount > 0 && (
                    <span>{featuredPost.viewCount.toLocaleString('pt-BR')} leituras</span>
                  )}
                </div>
                <Link
                  href={`/${category.slug}/${featuredPost.slug}`}
                  className="btn btn-primary"
                >
                  LER AGORA →
                </Link>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* ── POST GRID ── */}
      <div className="wrap">
        {gridPosts.length > 0 ? (
          <div className={styles.postGrid}>
            {gridPosts.map(p => (
              <article key={p.id} className={styles.postCard}>
                <Link href={`/${category.slug}/${p.slug}`} className={styles.cardImgWrap}>
                  <div className={`${styles.cardImg} ${p.imgColor === 'dark' ? styles.cardImgDark : ''}`}>
                    {p.coverUrl ? (
                      <img src={p.coverUrl} alt={p.title} loading="lazy" />
                    ) : (
                      <span className={styles.cardImgLabel}>{p.imgLabel || 'LEIA'}</span>
                    )}
                  </div>
                </Link>
                <div className={styles.cardBody}>
                  {p.kicker && (
                    <p className={styles.cardKicker}>{p.kicker}</p>
                  )}
                  <h3 className={styles.cardTitle}>
                    <Link href={`/${category.slug}/${p.slug}`}>{p.title}</Link>
                  </h3>
                  {p.dek && <p className={styles.cardExcerpt}>{p.dek}</p>}
                  <footer className={styles.cardFoot}>
                    <div className={styles.cardMeta}>
                      {p.publishedAt && (
                        <span>{formatDateShort(p.publishedAt)}</span>
                      )}
                      {p.readTime && <span>{p.readTime}</span>}
                    </div>
                    <Link
                      href={`/${category.slug}/${p.slug}`}
                      className={styles.cardReadLink}
                    >
                      LER →
                    </Link>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Nenhum post encontrado{q ? ` para "${q}"` : ''}.</p>
            {q && (
              <Link href={`/categoria/${slug}`} className="btn btn-ghost" style={{ marginTop: '16px' }}>
                LIMPAR BUSCA
              </Link>
            )}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {pages > 1 && (
          <nav className="pagination" aria-label="Paginação">
            {page > 1 && (
              <Link href={buildHref(page - 1)}>←</Link>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
              n === page
                ? <span key={n} className="active">{n}</span>
                : <Link key={n} href={buildHref(n)}>{n}</Link>
            ))}
            {page < pages && (
              <Link href={buildHref(page + 1)}>→</Link>
            )}
          </nav>
        )}
      </div>

      {/* ── NEWSLETTER CTA ── */}
      <section className={styles.newsletterSection}>
        <div className="wrap">
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterCopy}>
              <p className={styles.newsletterEyebrow}>ARQUIBANCADA DIGITAL</p>
              <h2 className={styles.newsletterHeading}>
                Não perca nenhuma <em>crônica</em>
              </h2>
              <p className={styles.newsletterSub}>
                Todo post de {category.name} na sua caixa de entrada. Futebol com alma.
              </p>
            </div>
            <form className="newsletter-form" action="/api/newsletter" method="post">
              <input type="email" name="email" placeholder="seu@email.com" required />
              <button type="submit">ASSINAR GRÁTIS</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
