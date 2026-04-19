'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Post, Category, Author } from '@/lib/db/schema';
import { slugify } from '@/lib/utils';
import styles from './PostEditor.module.css';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false });

type Revision = { id: number; version: number; label: string | null; createdAt: Date | null };
type Props = { post: Post; categories: Category[]; authors: Author[]; revisions: Revision[] };

export default function PostEditor({ post, categories, authors, revisions }: Props) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [kicker, setKicker] = useState(post.kicker ?? '');
  const [dek, setDek] = useState(post.dek ?? '');
  const [content, setContent] = useState(post.content ?? '');
  const [categoryId, setCategoryId] = useState(post.categoryId?.toString() ?? '');
  const [authorId, setAuthorId] = useState(post.authorId?.toString() ?? '');
  const [status, setStatus] = useState(post.status ?? 'draft');
  const [tags, setTags] = useState(post.tags ?? '');
  const [metaTitle, setMetaTitle] = useState(post.metaTitle ?? '');
  const [metaDesc, setMetaDesc] = useState(post.metaDescription ?? '');
  const [featured, setFeatured] = useState(post.featured ?? false);
  const [pinned, setPinned] = useState(post.pinned ?? false);
  const [allowComments, setAllowComments] = useState(post.allowComments ?? true);
  const [coverUrl, setCoverUrl] = useState(post.coverUrl ?? '');
  const [imgLabel, setImgLabel] = useState(post.imgLabel ?? '');
  const [imgColor, setImgColor] = useState(post.imgColor ?? 'red');
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const coverRef = useRef<HTMLInputElement>(null);

  async function save(fields?: Partial<Record<string, unknown>>) {
    setSaveStatus('saving');
    const body = {
      title, slug, kicker, dek, content, categoryId, authorId,
      status, tags, metaTitle, metaDescription: metaDesc, featured, pinned, allowComments,
      coverUrl, imgLabel, imgColor,
      ...fields,
    };
    await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaveStatus('saved');
  }

  function scheduleAutosave() {
    setSaveStatus('unsaved');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(), 3000);
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!post.slug || post.slug.startsWith('rascunho-')) setSlug(slugify(v));
    scheduleAutosave();
  }

  async function uploadCover(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (data.url) { setCoverUrl(data.url); scheduleAutosave(); }
    setUploading(false);
  }

  async function publish() {
    await save({ status: 'published' });
    setStatus('published');
  }

  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;

  return (
    <div className={styles.wrap}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <Link href="/admin/posts" className={styles.back}>← VOLTAR</Link>
        <div className={styles.breadcrumb}>
          <span>ADMIN</span><span>/</span><span>POSTS</span><span>/</span>
          <span style={{ color: 'var(--ink)' }}>EDITOR</span>
        </div>
        <div className={styles.saveStatus}>
          <span className={`${styles.dot} ${saveStatus === 'saving' ? styles.dotYellow : saveStatus === 'saved' ? styles.dotGreen : styles.dotRed}`} />
          {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo' : 'Não salvo'}
        </div>
        <div className={styles.topbarActions}>
          <button onClick={() => save()} className="btn btn-ghost" style={{ fontSize: '12px', padding: '8px 14px' }}>SALVAR</button>
          <button onClick={publish} className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 14px' }}>
            {status === 'published' ? 'ATUALIZAR' : 'PUBLICAR →'}
          </button>
        </div>
      </div>

      <div className={styles.shell}>
        {/* CANVAS */}
        <div className={styles.canvas}>
          <div className={styles.canvasInner}>
            <div className={styles.metaLine}>
              <select value={categoryId} onChange={e => { setCategoryId(e.target.value); scheduleAutosave(); }} className={styles.catSelect}>
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={kicker} onChange={e => { setKicker(e.target.value); scheduleAutosave(); }} placeholder="— KICKER / LINHA DE APOIO —" className={styles.kickerInput} />
            </div>

            <textarea
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Título da crônica"
              className={styles.titleField}
              rows={2}
            />

            <textarea
              value={dek}
              onChange={e => { setDek(e.target.value); scheduleAutosave(); }}
              placeholder="Subtítulo / DEK — um resumo da história"
              className={styles.dekField}
              rows={2}
            />

            <TiptapEditor content={content} onChange={v => { setContent(v); scheduleAutosave(); }} />

            <div className={styles.footBar}>
              <span>{wordCount} palavras</span>
              <span>{post.readTime ?? '—'}</span>
              <span>ID: {post.id}</span>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className={styles.side}>
          {/* Cover Image */}
          <div className={styles.sideBlock}>
            <h4>Imagem de Capa</h4>
            <div
              className={styles.coverDrop}
              onClick={() => coverRef.current?.click()}
              style={{ backgroundImage: coverUrl ? `url(${coverUrl})` : undefined }}
            >
              {!coverUrl && <span>{uploading ? 'Enviando…' : '+ Clique para enviar imagem'}</span>}
              {coverUrl && <div className={styles.coverOverlay}>{uploading ? 'Enviando…' : 'Trocar imagem'}</div>}
            </div>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])} />
            {coverUrl && (
              <button className={styles.removeCover} onClick={() => { setCoverUrl(''); scheduleAutosave(); }}>
                Remover imagem
              </button>
            )}
            <div className={styles.field}>
              <label>Texto do placeholder (sem imagem)</label>
              <input value={imgLabel} onChange={e => { setImgLabel(e.target.value); scheduleAutosave(); }} placeholder="DESTAQUE" />
            </div>
            <div className={styles.field}>
              <label>Cor do placeholder</label>
              <select value={imgColor} onChange={e => { setImgColor(e.target.value); scheduleAutosave(); }}>
                <option value="red">Vermelho</option>
                <option value="dark">Escuro</option>
                <option value="yellow">Amarelo</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className={styles.sideBlock}>
            <h4>Status & Publicação</h4>
            <div className={styles.field}>
              <label>Status</label>
              <select value={status} onChange={e => { setStatus(e.target.value); scheduleAutosave(); }}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Agendado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Autor</label>
              <select value={authorId} onChange={e => { setAuthorId(e.target.value); scheduleAutosave(); }}>
                <option value="">Sem autor</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className={styles.toggleRow}>
              <label><input type="checkbox" checked={featured} onChange={e => { setFeatured(e.target.checked); scheduleAutosave(); }} /> Destaque na home</label>
            </div>
            <div className={styles.toggleRow}>
              <label><input type="checkbox" checked={pinned} onChange={e => { setPinned(e.target.checked); scheduleAutosave(); }} /> Fixar no topo</label>
            </div>
            <div className={styles.toggleRow}>
              <label><input type="checkbox" checked={allowComments} onChange={e => { setAllowComments(e.target.checked); scheduleAutosave(); }} /> Comentários</label>
            </div>
          </div>

          {/* Slug & Tags */}
          <div className={styles.sideBlock}>
            <h4>Metadados</h4>
            <div className={styles.field}>
              <label>Slug (URL)</label>
              <input value={slug} onChange={e => { setSlug(e.target.value); scheduleAutosave(); }} />
            </div>
            <div className={styles.field}>
              <label>Tags (separadas por vírgula)</label>
              <input value={tags} onChange={e => { setTags(e.target.value); scheduleAutosave(); }} placeholder="flamengo, libertadores" />
            </div>
          </div>

          {/* SEO */}
          <div className={styles.sideBlock}>
            <h4>SEO</h4>
            <div className={styles.field}>
              <label>Meta título</label>
              <input value={metaTitle} onChange={e => { setMetaTitle(e.target.value); scheduleAutosave(); }} placeholder={title} />
            </div>
            <div className={styles.field}>
              <label>Meta descrição</label>
              <textarea value={metaDesc} onChange={e => { setMetaDesc(e.target.value); scheduleAutosave(); }} rows={3} placeholder={dek} />
            </div>
            <div className={styles.seoPreview}>
              <div className={styles.seoUrl}>podflah.blog › {slug}</div>
              <div className={styles.seoTitle}>{metaTitle || title}</div>
              <div className={styles.seoDesc}>{metaDesc || dek}</div>
            </div>
          </div>

          {/* History */}
          {revisions.length > 0 && (
            <div className={styles.sideBlock}>
              <h4>Histórico ({revisions.length})</h4>
              {revisions.slice(0, 5).map(r => (
                <div key={r.id} className={styles.revItem}>
                  <span>v{r.version}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
