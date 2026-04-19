import Link from 'next/link';
import { Post, Category, Author } from '@/lib/db/schema';
import { formatDateShort } from '@/lib/utils';
import styles from './PostCard.module.css';

type PostCardProps = {
  post: Post & { category?: Category | null; author?: Author | null };
  featured?: boolean;
};

export default function PostCard({ post, featured = false }: PostCardProps) {
  const href = `/${post.category?.slug ?? 'post'}/${post.slug}`;
  const chipClass = post.category?.color === 'red' ? 'red'
    : post.category?.color === 'black' ? 'black' : '';

  return (
    <article className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <Link href={href} className={styles.imgWrap}>
        <div className={`${styles.img} ${post.imgColor === 'dark' ? styles.dark : ''}`}>
          {post.coverUrl ? (
            <img src={post.coverUrl} alt={post.title} loading="lazy" />
          ) : (
            <span className={styles.imgLabel} style={{ fontSize: featured ? '48px' : '32px' }}>
              {post.imgLabel || 'LEIA'}
            </span>
          )}
        </div>
        <div className={styles.tape} />
      </Link>
      <div className={styles.body}>
        {post.category && (
          <Link href={`/categoria/${post.category.slug}`} className={`cat-chip ${chipClass}`}>
            {post.category.name}
          </Link>
        )}
        <h2 className={styles.title}>
          <Link href={href}>{post.title}</Link>
        </h2>
        {post.dek && <p className={styles.excerpt}>{post.dek}</p>}
        <footer className={styles.foot}>
          <span className={styles.author}>{post.author?.name ?? 'PodFlah'}</span>
          <span className={styles.meta}>
            {post.readTime && <span>{post.readTime}</span>}
            {post.publishedAt && <span>{formatDateShort(post.publishedAt)}</span>}
          </span>
        </footer>
      </div>
    </article>
  );
}
