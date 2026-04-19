'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../Dashboard.module.css';
import catStyles from './Categorias.module.css';

type Cat = { id: number; name: string; slug: string; color: string | null; postCount: number | null; description: string | null };

export default function CategoriasPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('yellow');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCats(data);
  }

  useEffect(() => { load(); }, []);

  function autoSlug(n: string) {
    return n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug: autoSlug(name), description: desc, color }),
    });
    setName(''); setDesc(''); setColor('yellow');
    setMsg('Categoria criada!');
    await load();
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  }

  async function remove(id: number) {
    if (!confirm('Excluir categoria?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    await load();
  }

  const chipClass = (c: string | null) => c === 'red' ? 'red' : c === 'black' ? 'black' : '';

  return (
    <>
      <div className={styles.topbar}>
        <h1 className={styles.topbarTitle}>Categorias <em>do blog</em></h1>
        <div className={styles.topbarActions}>
          <Link href="/admin" className="btn btn-ghost" style={{ fontSize: '12px', padding: '8px 14px' }}>← Dashboard</Link>
        </div>
      </div>

      <div className={styles.pad}>
        <div className={catStyles.grid}>
          {/* LIST */}
          <div>
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Cor</th>
                  <th>Posts</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c.id}>
                    <td><span className={`cat-chip ${chipClass(c.color)}`}>{c.name}</span></td>
                    <td style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '11px', color: 'var(--muted)' }}>{c.slug}</td>
                    <td style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '11px' }}>{c.color}</td>
                    <td style={{ fontFamily: '"Oswald",sans-serif', fontWeight: 700 }}>{c.postCount ?? 0}</td>
                    <td>
                      <div className={styles.tblActions}>
                        <a href={`/categoria/${c.slug}`} target="_blank">Ver</a>
                        <a className={styles.danger} onClick={() => remove(c.id)} style={{ cursor: 'pointer' }}>Excluir</a>
                      </div>
                    </td>
                  </tr>
                ))}
                {cats.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: '"JetBrains Mono",monospace', fontSize: '12px' }}>
                    Nenhuma categoria criada ainda.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FORM */}
          <div className={catStyles.formCard}>
            <h3>Nova categoria</h3>
            {msg && <div className={catStyles.success}>{msg}</div>}
            <form onSubmit={create} className={catStyles.form}>
              <div className={catStyles.field}>
                <label>Nome</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Crônicas" />
              </div>
              <div className={catStyles.field}>
                <label>Slug (URL)</label>
                <input value={autoSlug(name)} readOnly style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--muted)' }} />
              </div>
              <div className={catStyles.field}>
                <label>Descrição</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Breve descrição..." />
              </div>
              <div className={catStyles.field}>
                <label>Cor do chip</label>
                <select value={color} onChange={e => setColor(e.target.value)}>
                  <option value="yellow">Amarelo (padrão)</option>
                  <option value="red">Vermelho</option>
                  <option value="black">Preto</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'CRIANDO...' : 'CRIAR CATEGORIA'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
