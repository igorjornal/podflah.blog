export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db, posts, categories } from '@/lib/db';
import { desc, eq, count } from 'drizzle-orm';
import { formatDateShort } from '@/lib/utils';
import styles from '../Dashboard.module.css';

type Props = { searchParams: { status?: string } };

export default async function PostsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const activeStatus = searchParams.status ?? 'all';

  const [allPosts, cats, counts] = await Promise.all([
    db.select().from(posts)
      .where(activeStatus !== 'all' ? eq(posts.status, activeStatus) : undefined)
      .orderBy(desc(posts.updatedAt))
      .limit(50),
    db.select().from(categories),
    db.select({ status: posts.status, n: count() }).from(posts).groupBy(posts.status),
  ]);

  const catMap = Object.fromEntries(cats.map(c => [c.id, c]));
  const countMap = Object.fromEntries(counts.map(c => [c.status, c.n]));
  const total = (Object.values(countMap) as number[]).reduce((a, b) => a + b, 0);

  const tabs = [
    { key: 'all', label: 'Todos', count: total },
    { key: 'published', label: 'Publicados', count: countMap.published ?? 0 },
    { key: 'draft', label: 'Rascunhos', count: countMap.draft ?? 0 },
    { key: 'scheduled', label: 'Agendados', count: countMap.scheduled ?? 0 },
  ];

  return (
    <>
      <div className={styles.topbar}>
        <h1 className={styles.topbarTitle}>Posts <em>publicados</em></h1>
        <div className={styles.topbarActions}>
          <Link href="/admin/posts/novo" className="btn btn-primary">+ NOVO POST</Link>
        </div>
      </div>
      <div className={styles.pad}>
        <div className={styles.subHeader}>
          <div className={styles.filterTabs}>
            {tabs.map(t => (
              <Link
                key={t.key}
                href={t.key === 'all' ? '/admin/posts' : `/admin/posts?status=${t.key}`}
                className={`${styles.filterTab} ${activeStatus === t.key ? styles.filterTabActive : ''}`}
              >
                {t.label} ({t.count})
              </Link>
            ))}
          </div>
          <Link href="/admin/posts/novo" className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: '12px', padding: '8px 14px' }}>+ Novo</Link>
        </div>

        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Data</th>
              <th>Views</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {allPosts.map(p => (
              <tr key={p.id}>
                <td>
                  <div className={styles.tblTitle}>
                    {p.title}
                    <small>{p.slug}</small>
                  </div>
                </td>
                <td>
                  {p.categoryId && catMap[p.categoryId] ? (
                    <span className={`cat-chip ${catMap[p.categoryId].color === 'red' ? 'red' : catMap[p.categoryId].color === 'black' ? 'black' : ''}`}>
                      {catMap[p.categoryId].name}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <span className={`tag ${p.status === 'published' ? 'pub' : p.status === 'scheduled' ? 'sched' : 'draft'}`}>
                    {p.status === 'published' ? 'Publicado' : p.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                  </span>
                </td>
                <td style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {p.publishedAt ? formatDateShort(p.publishedAt) : formatDateShort(p.createdAt)}
                </td>
                <td style={{ fontFamily: '"Oswald", sans-serif', fontWeight: 700 }}>{p.viewCount ?? 0}</td>
                <td>
                  <div className={styles.tblActions}>
                    <Link href={`/admin/posts/${p.id}`}>Editar</Link>
                    {p.status === 'published' && p.categoryId && catMap[p.categoryId] && (
                      <Link href={`/${catMap[p.categoryId].slug}/${p.slug}`} target="_blank">Ver</Link>
                    )}
                    <a href={`/api/posts/${p.id}`} className={styles.danger} onClick={(e) => { e.preventDefault(); if (confirm('Excluir post?')) fetch(`/api/posts/${p.id}`, { method: 'DELETE' }).then(() => location.reload()); }}>Excluir</a>
                  </div>
                </td>
              </tr>
            ))}
            {allPosts.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' }}>
                Nenhum post encontrado. <Link href="/admin/posts/novo">Criar o primeiro →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
