import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { count } from 'drizzle-orm';
import styles from './Admin.module.css';
import AdminLogoutButton from './AdminLogoutButton';

async function getPostCount() {
  const result = await db.select({ value: count() }).from(posts);
  return result[0]?.value ?? 0;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const postCount = await getPostCount();

  const userName = session?.user?.name ?? 'Admin';
  const initials = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <div className={styles.logoMark}>P</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>PODFLAH</span>
            <span className={styles.brandSub}>admin</span>
          </div>
          <span className={styles.betaBadge}>BETA</span>
        </Link>

        <nav className={styles.nav}>
          <p className={styles.navSectionLabel}>Principal</p>
          <Link href="/admin" className={styles.navLink}><span className={styles.navIcon}>▦</span>Dashboard</Link>
          <Link href="/admin/posts/novo" className={styles.navLink}><span className={styles.navIcon}>✎</span>Novo post</Link>
          <Link href="/admin/posts" className={styles.navLink}><span className={styles.navIcon}>≡</span>Posts<span className={styles.navBadge}>{postCount}</span></Link>
          <Link href="/admin/categorias" className={styles.navLink}><span className={styles.navIcon}>◉</span>Categorias</Link>

          <p className={styles.navSectionLabel}>Mídia</p>
          <Link href="/admin/newsletter" className={styles.navLink}><span className={styles.navIcon}>✉</span>Newsletter</Link>

          <p className={styles.navSectionLabel}>Site</p>
          <Link href="/" className={styles.navLink} target="_blank"><span className={styles.navIcon}>↗</span>Ver site</Link>
        </nav>

        <div className={styles.profile}>
          <div className={styles.profileAvatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{userName}</div>
            <div className={styles.profileRole}>Admin</div>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
