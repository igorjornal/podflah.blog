'use client';
import Link from 'next/link';
import styles from './NewsTicker.module.css';

type Post = { title: string; slug: string; categorySlug?: string };

export default function NewsTicker({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  const items = [...posts, ...posts]; // duplicate for seamless loop

  return (
    <div className={styles.ticker}>
      <span className={styles.label}>ÚLTIMAS</span>
      <div className={styles.track}>
        <div className={styles.scroll}>
          {items.map((p, i) => (
            <span key={i} className={styles.item}>
              <Link href={`/${p.categorySlug ?? 'post'}/${p.slug}`}>{p.title}</Link>
              <span className={styles.sep}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
