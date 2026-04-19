export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { posts, categories, authors } from '@/lib/db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { formatDate, formatDateShort } from '@/lib/utils';
import PostViewTracker from './PostViewTracker';
import styles from './PostPage.module.css';

type Params = { categoria: string; slug: string };

async function getPost(slug: string) {
  const rows = await db
    .select()
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .limit(1);

  if (!rows.length) return null;

  const { posts: post, categories: category, authors: author } = rows[0];
  return { post, category, author };
}

async function getRelated(categoryId: number | null, currentId: number) {
  if (!categoryId) return [];
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'published'), ne(posts.id, currentId)))
    .orderBy(desc(posts.publishedAt))
    .limit(3);
}

async function getAllCategories() {
  return db.select().from(categories);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPost(slug);
  if (!result) return { title: 'Post não encontrado' };

  const { post, category } = result;
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.dek || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      section: category?.name,
      images: post.coverUrl ? [{ url: post.coverUrl }] : [],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug, categoria } = await params;
  const result = await getPost(slug);
  if (!result) notFound();

  const { post, category, author } = result;

  // Verify category matches URL
  if (category && category.slug !== categoria) notFound();

  const [related, allCategories] = await Promise.all([
    getRelated(post.categoryId, post.id),
    getAllCategories(),
  ]);

  const chipClass = category?.color === 'red' ? 'red' : category?.color === 'black' ? 'black' : '';
  const tags = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className={styles.page}>
      {/* View tracker fires after hydration */}
      <PostViewTracker postId={post.id} />

      {/* ── TOP BAR ── */}
      <div className="wrap">
        <nav className="crumbs">
          <Link href="/">Blog</Link>
          <span className="sep">/</span>
          {category && <Link href={`/categoria/${category.slug}`}>{category.name}</Link>}
          {category && <span className="sep">/</span>}
          <span>{post.title}</span>
        </nav>
      </div>

      {/* ── ARTICLE HEADER ── */}
      <header className={styles.articleHeader}>
        <div className="wrap">
          <div className={styles.headerInner}>
            {category && (
              <Link href={`/categoria/${category.slug}`} className={`cat-chip ${chipClass}`}>
                {category.name}
              </Link>
            )}
            {post.kicker && <p className={styles.kicker}>{post.kicker}</p>}
            <h1 className={styles.title}>{post.title}</h1>
            {post.dek && <p className={styles.dek}>{post.dek}</p>}
            <div className={styles.meta}>
              {author && (
                <Link href={`/autor/${author.slug}`} className={styles.byline}>
                  <div className="avatar">{author.initials ?? author.name[0]}</div>
                  <span className={styles.authorName}>{author.name}</span>
                </Link>
              )}
              <div className={styles.metaItems}>
                {post.publishedAt && (
                  <span className={styles.metaItem}>
                    <span className={styles.metaIcon}>📅</span>
                    {formatDate(post.publishedAt)}
                  </span>
                )}
                {post.readTime && (
                  <span className={styles.metaItem}>
                    <span className={styles.metaIcon}>⏱</span>
                    {post.readTime} de leitura
                  </span>
                )}
                {post.viewCount != null && post.viewCount > 0 && (
                  <span className={styles.metaItem}>
                    <span className={styles.metaIcon}>👁</span>
                    {post.viewCount.toLocaleString('pt-BR')} leituras
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO IMAGE ── */}
      <div className={styles.heroWrap}>
        <div className={`${styles.heroImg} ${post.imgColor === 'dark' ? styles.heroDark : ''}`}>
          {post.coverUrl ? (
            <img src={post.coverUrl} alt={post.title} />
          ) : (
            <span className={styles.heroLabel}>{post.imgLabel || category?.name || 'LEIA'}</span>
          )}
        </div>
      </div>

      {/* ── 3-COLUMN BODY ── */}
      <div className="wrap">
        <div className={styles.bodyLayout}>

          {/* LEFT: Sticky tools */}
          <aside className={styles.toolsAside}>
            <div className={styles.toolsSticky}>
              <button className={styles.toolBtn} title="Curtir" aria-label="Curtir artigo">
                <span>♥</span>
              </button>
              <button className={styles.toolBtn} title="Compartilhar" aria-label="Compartilhar artigo">
                <span>↑</span>
              </button>
              <button className={styles.toolBtn} title="Salvar" aria-label="Salvar artigo">
                <span>☆</span>
              </button>
              <div className={styles.toolDivider} />
              <button className={styles.toolBtnFont} title="Ajustar tamanho do texto" aria-label="Tamanho do texto">
                <span>Aa</span>
              </button>
            </div>
          </aside>

          {/* CENTER: Prose */}
          <article className={styles.proseWrap}>
            {tags.length > 0 && (
              <div className={styles.tagsRow}>
                {tags.map(tag => (
                  <Link key={tag} href={`/arquivo?q=${encodeURIComponent(tag)}`} className={styles.tagLink}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Article footer */}
            <footer className={styles.articleFoot}>
              <div className={styles.footDivider} />
              <div className={styles.footMeta}>
                {post.publishedAt && (
                  <span>Publicado em {formatDate(post.publishedAt)}</span>
                )}
                {post.readTime && <span>{post.readTime} de leitura</span>}
              </div>
              {tags.length > 0 && (
                <div className={styles.footTags}>
                  <span className={styles.footTagsLabel}>Tags:</span>
                  {tags.map(tag => (
                    <Link key={tag} href={`/arquivo?q=${encodeURIComponent(tag)}`} className={styles.tagLink}>
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </footer>
          </article>

          {/* RIGHT: Sidebar */}
          <aside className={styles.articleSidebar}>

            {/* Author card */}
            {author && (
              <div className={styles.sideCard}>
                <div className={styles.sideCardLabel}>AUTOR</div>
                <div className={styles.authorCard}>
                  <div className={styles.authorAvatar}>
                    {author.avatarUrl
                      ? <img src={author.avatarUrl} alt={author.name} />
                      : <span>{author.initials ?? author.name[0]}</span>}
                  </div>
                  <div className={styles.authorInfo}>
                    <strong className={styles.authorName2}>{author.name}</strong>
                    {author.role && <small className={styles.authorRole}>{author.role}</small>}
                  </div>
                </div>
                {author.bio && <p className={styles.authorBio}>{author.bio}</p>}
                <div className={styles.authorActions}>
                  <Link href={`/autor/${author.slug}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '11px' }}>
                    VER PERFIL
                  </Link>
                </div>
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <div className={styles.sideCard}>
                <div className={styles.sideCardLabel}>RELACIONADOS</div>
                <div className={styles.relatedList}>
                  {related.map(r => (
                    <Link key={r.id} href={`/${category?.slug ?? 'post'}/${r.slug}`} className={styles.relatedItem}>
                      <div className={styles.relatedThumb}>
                        {r.coverUrl
                          ? <img src={r.coverUrl} alt={r.title} />
                          : <span className={styles.relatedThumbLabel}>{r.imgLabel ?? 'LEIA'}</span>}
                      </div>
                      <div className={styles.relatedText}>
                        <span className={styles.relatedTitle}>{r.title}</span>
                        {r.publishedAt && (
                          <span className={styles.relatedDate}>{formatDateShort(r.publishedAt)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className={`${styles.sideCard} ${styles.newsletterCard}`}>
              <div className={styles.sideCardLabel}>NEWSLETTER</div>
              <p className={styles.newsletterText}>
                Receba cada crônica direto no seu e-mail, antes de todo mundo.
              </p>
              <form className="newsletter-form" action="/api/newsletter" method="post">
                <input type="email" name="email" placeholder="seu@email.com" required />
                <button type="submit">QUERO</button>
              </form>
            </div>

            {/* Categories nav */}
            <div className={styles.sideCard}>
              <div className={styles.sideCardLabel}>CATEGORIAS</div>
              <div className={styles.catNav}>
                {allCategories.map(c => (
                  <Link
                    key={c.id}
                    href={`/categoria/${c.slug}`}
                    className={`${styles.catNavLink} ${c.id === category?.id ? styles.catNavActive : ''}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── POST-ARTICLE NEWSLETTER SECTION ── */}
      <section className={styles.newsletterSection}>
        <div className="wrap">
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterCopy}>
              <p className={styles.newsletterEyebrow}>ARQUIBANCADA DIGITAL</p>
              <h2 className={styles.newsletterHeading}>
                Não perca nenhuma <em>crônica</em>
              </h2>
              <p className={styles.newsletterSub}>
                Futebol com alma, análise com raiva e amor. Toda semana na sua caixa de entrada.
              </p>
            </div>
            <form className={`newsletter-form ${styles.newsletterFormLarge}`} action="/api/newsletter" method="post">
              <input type="email" name="email" placeholder="seu@email.com" required />
              <button type="submit">ASSINAR GRÁTIS</button>
            </form>
          </div>
        </div>
      </section>

      {/* ── RELATED POSTS GRID ── */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="wrap">
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedHeading}>Leia também</h2>
              {category && (
                <Link href={`/categoria/${category.slug}`} className="btn btn-ghost">
                  VER CATEGORIA →
                </Link>
              )}
            </div>
            <div className={styles.relatedGrid}>
              {related.map(r => (
                <article key={r.id} className={styles.relatedCard}>
                  <Link href={`/${category?.slug ?? 'post'}/${r.slug}`} className={styles.relatedCardImg}>
                    <div className={`${styles.relatedCardThumb} ${r.imgColor === 'dark' ? styles.relatedCardDark : ''}`}>
                      {r.coverUrl
                        ? <img src={r.coverUrl} alt={r.title} />
                        : <span className={styles.relatedCardLabel}>{r.imgLabel ?? 'LEIA'}</span>}
                    </div>
                  </Link>
                  <div className={styles.relatedCardBody}>
                    {category && (
                      <Link href={`/categoria/${category.slug}`} className={`cat-chip ${chipClass}`}>
                        {category.name}
                      </Link>
                    )}
                    <h3 className={styles.relatedCardTitle}>
                      <Link href={`/${category?.slug ?? 'post'}/${r.slug}`}>{r.title}</Link>
                    </h3>
                    <div className={styles.relatedCardMeta}>
                      {r.publishedAt && <span>{formatDateShort(r.publishedAt)}</span>}
                      {r.readTime && <span>{r.readTime}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
