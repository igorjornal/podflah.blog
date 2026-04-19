'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { type Post, type Category } from '@/lib/db/schema';
import { formatDate, formatDateShort } from '@/lib/utils';
import styles from './ArchivePage.module.css';

const POPULAR_CHIPS = [
  'Flamengo',
  'Maracanã',
  'Copa do Brasil',
  'Libertadores',
  'Mercado',
];

type PostWithCat = Post & { category: Category | null };

function groupByYear(posts: PostWithCat[]): Record<string, PostWithCat[]> {
  const groups: Record<string, PostWithCat[]> = {};
  for (const post of posts) {
    const year = post.publishedAt
      ? new Date(post.publishedAt).getFullYear().toString()
      : 'Sem data';
    if (!groups[year]) groups[year] = [];
    groups[year].push(post);
  }
  return groups;
}

type Props = {
  initialPosts: PostWithCat[];
  allCategories: Category[];
  initialQ: string;
  initialCat: string;
  initialSort: string;
};

export default function ArchiveClient({
  initialPosts,
  allCategories,
  initialQ,
  initialCat,
  initialSort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState(initialCat);
  const [sort, setSort] = useState(initialSort);

  const applyFilters = useCallback(
    (newQ: string, newCat: string, newSort: string) => {
      const sp = new URLSearchParams();
      if (newQ) sp.set('q', newQ);
      if (newCat) sp.set('cat', newCat);
      if (newSort && newSort !== 'recente') sp.set('sort', newSort);
      const qs = sp.toString();
      startTransition(() => {
        router.push(`${pathname}${qs ? '?' + qs : ''}`);
      });
    },
    [router, pathname],
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    applyFilters(q, cat, sort);
  }

  function handleChip(chip: string) {
    const newQ = chip;
    setQ(newQ);
    applyFilters(newQ, cat, sort);
  }

  function handleCatChange(newCat: string) {
    setCat(newCat);
    applyFilters(q, newCat, sort);
  }

  function handleSortChange(newSort: string) {
    setSort(newSort);
    applyFilters(q, cat, newSort);
  }

  const grouped = groupByYear(initialPosts);
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  const hasResults = initialPosts.length > 0;
  const totalResults = initialPosts.length;

  return (
    <div className={styles.page}>
      {/* ── PAGE HEADER ── */}
      <div className={styles.pageHeader}>
        <div className="wrap">
          <nav className="crumbs">
            <Link href="/">Blog</Link>
            <span className="sep">/</span>
            <span>Arquivo</span>
          </nav>
          <div className={styles.headerGrid}>
            <div>
              <h1 className={styles.pageTitle}>
                Arquivo<br />
                <em>Completo</em>
              </h1>
              <p className={styles.pageSubtitle}>
                {totalResults > 0
                  ? `${totalResults} artigo${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
                  : 'Busque entre todos os artigos publicados'}
              </p>
            </div>
            <div className={styles.headerDecor}>
              <span className={styles.headerDecorNum}>∞</span>
              <span className={styles.headerDecorLabel}>ARTIGOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className={styles.searchSection}>
        <div className="wrap">
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon} aria-hidden="true">⌕</span>
              <input
                type="search"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar artigos, temas, jogadores…"
                className={styles.searchInput}
                aria-label="Buscar artigos"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {isPending ? 'BUSCANDO…' : 'BUSCAR'}
            </button>
          </form>

          {/* Popular search chips */}
          <div className={styles.chipsRow}>
            <span className={styles.chipsLabel}>Popular:</span>
            {POPULAR_CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChip(chip)}
                className={`${styles.chip} ${q === chip ? styles.chipActive : ''}`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER PANEL ── */}
      <div className={styles.filterPanel}>
        <div className="wrap">
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="filter-cat">CATEGORIA</label>
              <select
                id="filter-cat"
                value={cat}
                onChange={e => handleCatChange(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas</option>
                {allCategories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="filter-sort">ORDENAR</label>
              <select
                id="filter-sort"
                value={sort}
                onChange={e => handleSortChange(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="recente">Mais recentes</option>
                <option value="popular">Mais lidos</option>
              </select>
            </div>

            {(q || cat || sort !== 'recente') && (
              <button
                type="button"
                className={`btn btn-ghost ${styles.clearBtn}`}
                onClick={() => {
                  setQ('');
                  setCat('');
                  setSort('recente');
                  startTransition(() => router.push(pathname));
                }}
              >
                LIMPAR FILTROS ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="wrap">
        {isPending && (
          <div className={styles.loading}>Carregando…</div>
        )}

        {!isPending && !hasResults && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Nenhum resultado encontrado.</p>
            {q && (
              <p className={styles.emptyText}>
                Não encontramos artigos para <strong>"{q}"</strong>. Tente outros termos.
              </p>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => {
                setQ('');
                setCat('');
                setSort('recente');
                startTransition(() => router.push(pathname));
              }}
            >
              VER TODOS OS ARTIGOS
            </button>
          </div>
        )}

        {!isPending && hasResults && (
          <div className={styles.resultsList}>
            {years.map(year => (
              <div key={year} className={styles.yearGroup}>
                <div className={styles.yearHeader}>
                  <span className={styles.yearNum}>{year}</span>
                  <div className={styles.yearLine} />
                  <span className={styles.yearCount}>
                    {grouped[year].length} post{grouped[year].length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className={styles.yearPosts}>
                  {grouped[year].map(post => {
                    const chipClass =
                      post.category?.color === 'red' ? 'red'
                        : post.category?.color === 'black' ? 'black' : '';
                    const href = `/${post.category?.slug ?? 'post'}/${post.slug}`;

                    return (
                      <article key={post.id} className={styles.postRow}>
                        {/* Thumbnail */}
                        <Link href={href} className={styles.rowThumbLink}>
                          <div className={`${styles.rowThumb} ${post.imgColor === 'dark' ? styles.rowThumbDark : ''}`}>
                            {post.coverUrl ? (
                              <img src={post.coverUrl} alt={post.title} loading="lazy" />
                            ) : (
                              <span className={styles.rowThumbLabel}>
                                {post.imgLabel || 'LEIA'}
                              </span>
                            )}
                          </div>
                        </Link>

                        {/* Content */}
                        <div className={styles.rowContent}>
                          <div className={styles.rowMeta}>
                            {post.category && (
                              <Link
                                href={`/categoria/${post.category.slug}`}
                                className={`cat-chip ${chipClass}`}
                              >
                                {post.category.name}
                              </Link>
                            )}
                            {post.publishedAt && (
                              <span className={styles.rowDate}>
                                {formatDateShort(post.publishedAt)}
                              </span>
                            )}
                            {post.readTime && (
                              <span className={styles.rowReadTime}>{post.readTime}</span>
                            )}
                          </div>

                          <h2 className={styles.rowTitle}>
                            <Link href={href}>{post.title}</Link>
                          </h2>

                          {post.dek && (
                            <p className={styles.rowExcerpt}>{post.dek}</p>
                          )}

                          {post.tags && (
                            <div className={styles.rowTags}>
                              {post.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 4).map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleChip(tag)}
                                  className={styles.rowTag}
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <div className={styles.rowCta}>
                          <Link href={href} className="btn btn-ghost">
                            LER →
                          </Link>
                          {post.viewCount != null && post.viewCount > 0 && (
                            <span className={styles.rowViews}>
                              {post.viewCount.toLocaleString('pt-BR')} leituras
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── NEWSLETTER ── */}
      <section className={styles.newsletterSection}>
        <div className="wrap">
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterCopy}>
              <p className={styles.newsletterEyebrow}>FIQUE POR DENTRO</p>
              <h2 className={styles.newsletterHeading}>
                Futebol com <em>alma</em>
              </h2>
              <p className={styles.newsletterSub}>
                Cada crônica no seu e-mail. Análise com raiva e amor. Toda semana.
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
