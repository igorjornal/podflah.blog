'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Blog' },
  { href: '/categoria/cronicas', label: 'Crônicas' },
  { href: '/autor/igor-schwansing', label: 'Perfil Oficial' },
  { href: '/sobre', label: 'O PodFlah' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.topbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>P</span>
          <span>
            PODFLAH
            <small>.blog</small>
          </span>
        </Link>

        <nav className={styles.nav}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href)) ? styles.active : ''}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.social}>
          <a href="#" aria-label="Instagram" title="Instagram">IG</a>
          <a href="#" aria-label="Facebook" title="Facebook">FB</a>
          <a href="#" aria-label="YouTube" title="YouTube">YT</a>
          <a href="#" aria-label="TikTok" title="TikTok">TK</a>
        </div>
      </div>
    </header>
  );
}
