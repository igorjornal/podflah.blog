export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { db, authors, posts, categories } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import PostCard from '@/components/posts/PostCard';
import { formatDateShort } from '@/lib/utils';
import styles from './AutorPage.module.css';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [author] = await db.select().from(authors).where(eq(authors.slug, params.slug));
  if (!author) return {};
  return { title: author.name, description: author.bio ?? undefined };
}

export default async function AutorPage({ params }: Props) {
  const [author] = await db.select().from(authors).where(eq(authors.slug, params.slug));
  if (!author) notFound();

  const [authorPosts, cats] = await Promise.all([
    db.select().from(posts).where(eq(posts.authorId, author.id)).orderBy(desc(posts.publishedAt)).limit(9),
    db.select().from(categories),
  ]);

  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
  const topics = author.topics ? author.topics.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div>
      {/* HERO */}
      <div className="wrap">
        <div className={styles.hero}>
          <div className={styles.photo}>
            <div className={styles.photoInner}>
              <span className={styles.photoInitials}>{author.initials ?? 'IS'}</span>
            </div>
            <div className={styles.photoTape} />
          </div>
          <div className={styles.info}>
            <div className={styles.crumbs}>
              <Link href="/">BLOG</Link><span className={styles.sep}>/</span>
              <Link href="#">AUTORES</Link><span className={styles.sep}>/</span>
              <span>{author.name.toUpperCase()}</span>
            </div>
            {author.role && <div className={styles.role}>{author.role}</div>}
            <h1 className={styles.name}>{author.name}</h1>
            {author.bio && <p className={styles.bio}>{author.bio}</p>}
            <div className={styles.contacts}>
              {author.instagram && <a href={`https://instagram.com/${author.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>IG</a>}
              {author.youtube && <a href={author.youtube} target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>YT</a>}
              {author.email && <a href={`mailto:${author.email}`} className={styles.contactBtn}>✉</a>}
              {author.twitter && <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>X</a>}
            </div>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className={styles.statsStrip}>
        <div className="wrap">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}><strong>{author.postCount ?? 0}</strong><span>Posts publicados</span></div>
            <div className={styles.statItem}><strong>{author.podcastEpisodes ?? 0}</strong><span>Eps. de podcast</span></div>
            <div className={styles.statItem}><strong>{author.followers ? `${(author.followers / 1000).toFixed(1)}k` : '—'}</strong><span>Seguidores</span></div>
            <div className={styles.statItem}><strong>{author.yearStarted ?? '—'}</strong><span>Desde</span></div>
          </div>
        </div>
      </div>

      {/* ABOUT + TOPICS */}
      {(author.extendedBio || topics.length > 0) && (
        <div className="wrap">
          <div className={styles.aboutGrid}>
            {author.extendedBio && (
              <div className={styles.aboutText}>
                <h2>Sobre</h2>
                <div dangerouslySetInnerHTML={{ __html: author.extendedBio }} />
              </div>
            )}
            {topics.length > 0 && (
              <div>
                <h3 className={styles.topicsTitle}>Tópicos</h3>
                <div className={styles.topicsList}>
                  {topics.map(t => (
                    <Link key={t} href={`/arquivo?q=${encodeURIComponent(t)}`} className={styles.topicTag}>{t}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POSTS */}
      {authorPosts.length > 0 && (
        <div className="wrap">
          <div className={styles.postsSection}>
            <h2 className={styles.sectionTitle}>Posts recentes</h2>
            <div className={styles.postsGrid}>
              {authorPosts.map(p => (
                <PostCard key={p.id} post={{ ...p, category: catMap[p.categoryId ?? 0] ?? null, author }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className={styles.cta}>
        <div className="wrap">
          <div className={styles.ctaInner}>
            <h2>Receba cada crônica no e-mail</h2>
            <p>Assine a newsletter e seja o primeiro a ler quando um novo texto sair.</p>
            <form className="newsletter-form" action="/api/newsletter" method="post" style={{ maxWidth: '420px' }}>
              <input type="email" name="email" placeholder="seu@email.com" required />
              <button type="submit">ASSINAR</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
