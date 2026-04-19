export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { db } from '@/lib/db';
import { posts, categories, authors, siteSettings } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import PostCard from '@/components/posts/PostCard';
import styles from './Home.module.css';

async function getData() {
  const [allPosts, allCategories, allAuthors, settingsRows] = await Promise.all([
    db.select().from(posts).where(eq(posts.status, 'published')).orderBy(desc(posts.publishedAt)).limit(20),
    db.select().from(categories),
    db.select().from(authors).limit(1),
    db.select().from(siteSettings),
  ]);
  const settings: Record<string, string> = {};
  for (const r of settingsRows) settings[r.key] = r.value ?? '';
  return { allPosts, allCategories, allAuthors, settings };
}

export default async function HomePage() {
  const { allPosts, allCategories, allAuthors, settings } = await getData();

  const s = (key: string, fallback: string) => settings[key] || fallback;

  const featuredPost = allPosts.find(p => p.featured) ?? allPosts[0];
  const gridPosts = allPosts.filter(p => p.id !== featuredPost?.id).slice(0, 9);
  const mainAuthor = allAuthors[0];
  const catMap = Object.fromEntries(allCategories.map(c => [c.id, c]));
  const authorMap = Object.fromEntries(allAuthors.map(a => [a.id, a]));

  return (
    <div>
      <div className="wrap">
        <div className={styles.masthead}>
          <h1>{s('site_name_prefix','A')} <em>{s('site_name_highlight','Arquibancada')}</em><br />{s('site_name_suffix','do PodFlah')}</h1>
          <div className={styles.mastheadMeta}>
            <strong>{s('site_tagline_top','EDIÇÃO DIGITAL')}</strong><br />{s('site_tagline_mid','Futebol · Crônica · Análise')}<br />{s('site_tagline_bot','Desde 2018')}
          </div>
        </div>
        <div className={styles.editionBar}>
          <span className={styles.pill}>{s('nav_brand','ARQUIBANCADA')}</span>
          <span>{s('nav_center','O BLOG OFICIAL DO PODFLAH')}</span>
          <span>{s('nav_right', new Date().getFullYear() + ' · TEMPORADA EM CURSO')}</span>
        </div>
      </div>

      {featuredPost && (
        <div className="wrap">
          <div className={styles.hero}>
            <div className={`${styles.heroImg} ${featuredPost.imgColor === 'dark' ? styles.heroDark : ''}`}>
              {featuredPost.coverUrl
                ? <img src={featuredPost.coverUrl} alt={featuredPost.title} />
                : <span className={styles.imgLabel}>{featuredPost.imgLabel || 'DESTAQUE'}</span>}
            </div>
            <div className={styles.heroContent}>
              <div>
                {featuredPost.kicker && <p className={styles.heroKicker}>{featuredPost.kicker}</p>}
                <h2 className={styles.heroTitle}>{featuredPost.title}</h2>
                {featuredPost.dek && <p className={styles.heroExcerpt}>{featuredPost.dek}</p>}
              </div>
              <div className={styles.heroFooter}>
                <div className={styles.byline}>
                  <div className="avatar">{authorMap[featuredPost.authorId ?? 0]?.initials ?? 'P'}</div>
                  <span>{authorMap[featuredPost.authorId ?? 0]?.name ?? 'PodFlah'}</span>
                </div>
                <Link href={`/${catMap[featuredPost.categoryId ?? 0]?.slug ?? 'post'}/${featuredPost.slug}`} className={styles.readCta}>
                  LER AGORA →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wrap">
        <div className={styles.catBar}>
          <Link href="/" className={`${styles.catBtn} ${styles.catActive}`}>Todos</Link>
          {allCategories.map(c => (
            <Link key={c.id} href={`/categoria/${c.slug}`} className={styles.catBtn}>{c.name}</Link>
          ))}
          <Link href="/arquivo" className={styles.catBtn}>Arquivo →</Link>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.contentGrid}>
          <div>
            <div className={styles.postGrid}>
              {gridPosts.map(p => (
                <PostCard key={p.id} post={{ ...p, category: catMap[p.categoryId ?? 0] ?? null, author: authorMap[p.authorId ?? 0] ?? null }} />
              ))}
            </div>
            {gridPosts.length === 0 && (
              <div className={styles.empty}>
                <p>Ainda não há posts publicados.</p>
                <p>Acesse o <Link href="/admin">painel admin</Link> para criar o primeiro post.</p>
              </div>
            )}
          </div>

          <aside className={styles.sidebar}>
            {mainAuthor && (
              <div className={styles.sideCard}>
                <div className={styles.sideCardHead}>O AUTOR</div>
                <div className={styles.authorCard}>
                  <div className={styles.authorAvatar}>{mainAuthor.initials ?? 'IS'}</div>
                  <div><strong>{mainAuthor.name}</strong><small>{mainAuthor.role}</small></div>
                </div>
                {mainAuthor.bio && <p className={styles.authorBio}>{mainAuthor.bio}</p>}
                <div className={styles.authorStats}>
                  <div><strong>{mainAuthor.postCount}</strong><span>Posts</span></div>
                  <div><strong>{mainAuthor.podcastEpisodes}</strong><span>Eps.</span></div>
                  <div><strong>{mainAuthor.followers ? `${(mainAuthor.followers / 1000).toFixed(1)}k` : '—'}</strong><span>Seguidores</span></div>
                </div>
                <Link href={`/autor/${mainAuthor.slug}`} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>VER PERFIL</Link>
              </div>
            )}

            <div className={styles.sideCard}>
              <div className={styles.sideCardHead}>NEWSLETTER</div>
              <p className={styles.newsletterText}>Receba cada crônica direto no seu e-mail, antes de todo mundo.</p>
              <form className="newsletter-form" action="/api/newsletter" method="post">
                <input type="email" name="email" placeholder="seu@email.com" required />
                <button type="submit">QUERO</button>
              </form>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideCardHead}>CATEGORIAS</div>
              <div className={styles.catList}>
                {allCategories.map(c => (
                  <Link key={c.id} href={`/categoria/${c.slug}`} className={styles.catListItem}>
                    <span>{c.name}</span>
                    <span className={styles.catCount}>{c.postCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
