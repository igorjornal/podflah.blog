import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { posts, subscribers } from '@/lib/db/schema';
import { desc, eq, count, sql } from 'drizzle-orm';
import styles from './Dashboard.module.css';

async function getDashboardData() {
  const [
    publishedResult,
    draftResult,
    scheduledResult,
    totalPostsResult,
    subscribersResult,
    recentPosts,
    topPosts,
  ] = await Promise.all([
    db.select({ value: count() }).from(posts).where(eq(posts.status, 'published')),
    db.select({ value: count() }).from(posts).where(eq(posts.status, 'draft')),
    db.select({ value: count() }).from(posts).where(eq(posts.status, 'scheduled')),
    db.select({ value: count() }).from(posts),
    db.select({ value: count() }).from(subscribers).where(eq(subscribers.active, true)),
    db.select().from(posts).orderBy(desc(posts.createdAt)).limit(8),
    db.select().from(posts).orderBy(desc(posts.viewCount)).limit(5),
  ]);

  return {
    published: publishedResult[0]?.value ?? 0,
    drafts: draftResult[0]?.value ?? 0,
    scheduled: scheduledResult[0]?.value ?? 0,
    totalPosts: totalPostsResult[0]?.value ?? 0,
    subscribers: subscribersResult[0]?.value ?? 0,
    recentPosts,
    topPosts,
  };
}

const MOCK_CHART = [
  { day: '18/3', v: 240 }, { day: '19/3', v: 180 }, { day: '20/3', v: 320 },
  { day: '21/3', v: 410 }, { day: '22/3', v: 290 }, { day: '23/3', v: 150 },
  { day: '24/3', v: 600 }, { day: '25/3', v: 480 }, { day: '26/3', v: 390 },
  { day: '27/3', v: 270 }, { day: '28/3', v: 210 }, { day: '29/3', v: 340 },
  { day: '30/3', v: 880 }, { day: '31/3', v: 720 }, { day: '1/4', v: 560 },
  { day: '2/4', v: 440 }, { day: '3/4', v: 300 }, { day: '4/4', v: 190 },
  { day: '5/4', v: 260 }, { day: '6/4', v: 380 }, { day: '7/4', v: 950 },
  { day: '8/4', v: 820 }, { day: '9/4', v: 640 }, { day: '10/4', v: 500 },
  { day: '11/4', v: 430 }, { day: '12/4', v: 290 }, { day: '13/4', v: 350 },
  { day: '14/4', v: 410 }, { day: '15/4', v: 680 }, { day: '16/4', v: 520 },
];

const ACTIVITY_FEED = [
  { type: 'post', icon: '✎', text: 'Post publicado', detail: '"Flamengo 3x1 Santos — relato"', time: '2h atrás' },
  { type: 'subscriber', icon: '✉', text: 'Novo assinante', detail: 'joao@exemplo.com.br', time: '4h atrás' },
  { type: 'post', icon: '✎', text: 'Rascunho salvo', detail: '"A Copa começa neste sábado"', time: '6h atrás' },
  { type: 'subscriber', icon: '✉', text: 'Novo assinante', detail: 'torcedora@gmail.com', time: '8h atrás' },
  { type: 'post', icon: '✎', text: 'Post publicado', detail: '"Análise tática: Dorival"', time: '1d atrás' },
  { type: 'system', icon: '⚙', text: 'Backup automático', detail: 'Banco salvo com sucesso', time: '1d atrás' },
];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function StatusTag({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: 'Publicado', cls: styles.tagPublished },
    draft:     { label: 'Rascunho', cls: styles.tagDraft },
    scheduled: { label: 'Agendado', cls: styles.tagScheduled },
  };
  const s = map[status ?? 'draft'] ?? { label: status ?? '—', cls: styles.tagDraft };
  return <span className={`${styles.tag} ${s.cls}`}>{s.label}</span>;
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const data = await getDashboardData();
  const maxV = Math.max(...MOCK_CHART.map(d => d.v));

  const name = session.user?.name ?? 'Admin';

  return (
    <div className={styles.wrap}>
      {/* ── TOP BAR ── */}
      <div className={styles.topbar}>
        <div className={styles.topbarSearch}>
          <span className={styles.topbarSearchIcon}>🔍</span>
          <input className={styles.topbarSearchInput} type="search" placeholder="Buscar posts, categorias…" />
        </div>
        <div className={styles.topbarActions}>
          <Link href="/" className={styles.topbarBtnGhost} target="_blank">↗ Ver Site</Link>
          <Link href="/admin/posts/novo" className={styles.topbarBtnPrimary}>+ Novo Post</Link>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.content}>

        {/* Greeting */}
        <div className={styles.greeting}>
          <div>
            <h1 className={styles.greetingTitle}>
              Olá, <em className={styles.greetingEm}>{name}</em>!
            </h1>
            <p className={styles.greetingSub}>Aqui está o resumo do seu blog hoje.</p>
          </div>
          <div className={styles.streakBadge}>
            🔥 <strong>14</strong> dias seguidos
          </div>
        </div>

        {/* Quick action tiles */}
        <div className={styles.quickTiles}>
          <Link href="/admin/posts/novo" className={`${styles.tile} ${styles.tileAccent}`}>
            <span className={styles.tileIcon}>✎</span>
            <span className={styles.tileName}>Novo Post</span>
          </Link>
          <Link href="/admin/posts" className={styles.tile}>
            <span className={styles.tileIcon}>≡</span>
            <span className={styles.tileName}>Ver Posts</span>
            <span className={styles.tileMeta}>{data.totalPosts} total</span>
          </Link>
          <Link href="/admin/categorias" className={styles.tile}>
            <span className={styles.tileIcon}>◉</span>
            <span className={styles.tileName}>Categorias</span>
          </Link>
          <Link href="/" target="_blank" className={styles.tile}>
            <span className={styles.tileIcon}>↗</span>
            <span className={styles.tileName}>Ver Site</span>
          </Link>
        </div>

        {/* KPI cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Visitantes</div>
            <div className={styles.kpiValue}>12.4k</div>
            <div className={styles.kpiDelta}>↑ 8% este mês</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Posts Publicados</div>
            <div className={styles.kpiValue}>{data.published}</div>
            <div className={styles.kpiDelta}>{data.drafts} rascunhos · {data.scheduled} agendados</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Assinantes</div>
            <div className={styles.kpiValue}>{formatNumber(data.subscribers)}</div>
            <div className={styles.kpiDelta}>newsletter ativa</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Downloads Podcast</div>
            <div className={styles.kpiValue}>8.2k</div>
            <div className={styles.kpiDelta}>↑ 12% este mês</div>
          </div>
        </div>

        {/* Dashboard grid */}
        <div className={styles.dashGrid}>
          {/* Analytics panel */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Analytics — 30 dias</span>
              <span className={styles.panelMeta}>picos em dias de jogo</span>
            </div>
            <div className={styles.chartArea}>
              <div className={styles.chartBars}>
                {MOCK_CHART.map((d) => (
                  <div key={d.day} className={styles.chartCol}>
                    <div
                      className={styles.chartBar}
                      style={{ height: `${(d.v / maxV) * 100}%` }}
                      title={`${d.day}: ${d.v} visitas`}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.chartAxis}>
                {MOCK_CHART.filter((_, i) => i % 5 === 0).map(d => (
                  <span key={d.day}>{d.day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Top posts panel */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Posts mais lidos</span>
              <Link href="/admin/posts" className={styles.panelLink}>Ver todos →</Link>
            </div>
            <div className={styles.topPostsList}>
              {data.topPosts.length === 0 && (
                <p className={styles.emptyText}>Nenhum post ainda.</p>
              )}
              {data.topPosts.map((p, i) => (
                <div key={p.id} className={styles.topPostRow}>
                  <span className={styles.topPostRank}>{String(i + 1).padStart(2, '0')}</span>
                  <div className={styles.topPostInfo}>
                    <Link href={`/admin/posts/${p.id}`} className={styles.topPostTitle}>
                      {p.title}
                    </Link>
                    <span className={styles.topPostMeta}>{p.viewCount ?? 0} views</span>
                  </div>
                  <div className={styles.topPostBar}>
                    <div
                      className={styles.topPostBarFill}
                      style={{
                        width: `${data.topPosts[0]?.viewCount
                          ? Math.round(((p.viewCount ?? 0) / (data.topPosts[0].viewCount ?? 1)) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent posts table */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Posts recentes</span>
            <Link href="/admin/posts" className={styles.panelLink}>Gerenciar posts →</Link>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Views</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPosts.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.tdEmpty}>Nenhum post ainda.</td>
                  </tr>
                )}
                {data.recentPosts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className={styles.postTitle}>{p.title}</span>
                    </td>
                    <td><StatusTag status={p.status} /></td>
                    <td className={styles.tdMeta}>
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleDateString('pt-BR')
                        : new Date(p.createdAt!).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={styles.tdMeta}>{p.viewCount ?? 0}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link href={`/admin/posts/${p.id}`} className={styles.actionBtn}>Editar</Link>
                        {p.status === 'published' && (
                          <Link href={`/post/${p.slug}`} className={styles.actionBtnGhost} target="_blank">Ver</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Atividade recente</span>
          </div>
          <div className={styles.actFeed}>
            {ACTIVITY_FEED.map((item, i) => (
              <div key={i} className={styles.actItem}>
                <div className={`${styles.actIcon} ${item.type === 'subscriber' ? styles.actIconSub : item.type === 'system' ? styles.actIconSys : ''}`}>
                  {item.icon}
                </div>
                <div className={styles.actBody}>
                  <span className={styles.actText}>{item.text}</span>
                  <span className={styles.actDetail}>{item.detail}</span>
                </div>
                <span className={styles.actTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
