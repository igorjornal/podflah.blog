'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './Configuracoes.module.css';

const DEFAULTS = {
  site_logo: '',
  site_name_prefix: 'A',
  site_name_highlight: 'Arquibancada',
  site_name_suffix: 'do PodFlah',
  site_tagline_top: 'EDIÇÃO DIGITAL',
  site_tagline_mid: 'FUTEBOL · CRÔNICA · ANÁLISE',
  site_tagline_bot: 'DESDE 2018',
  nav_brand: 'ARQUIBANCADA',
  nav_center: 'O BLOG OFICIAL DO PODFLAH',
  nav_right: '2026 · TEMPORADA EM CURSO',
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorInstagram, setAuthorInstagram] = useState('');
  const [authorYoutube, setAuthorYoutube] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setSettings(s => ({ ...s, ...d }));
    });
    fetch('/api/authors').then(r => r.json()).then((authors: any[]) => {
      if (authors[0]) {
        const a = authors[0];
        setAuthorId(a.id);
        setAuthorName(a.name || '');
        setAuthorRole(a.role || '');
        setAuthorBio(a.bio || '');
        setAuthorInstagram(a.instagram || '');
        setAuthorYoutube(a.youtube || '');
        setAuthorAvatar(a.avatarUrl || '');
      }
    });
  }, []);

  async function saveSettings() {
    setSaving(true);
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    if (authorId) {
      await fetch(`/api/authors/${authorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authorName, role: authorRole, bio: authorBio, instagram: authorInstagram, youtube: authorYoutube, avatarUrl: authorAvatar }),
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (data.url) set('site_logo', data.url);
    setUploadingLogo(false);
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (data.url) setAuthorAvatar(data.url);
    setUploading(false);
  }

  function set(key: string, val: string) {
    setSettings(s => ({ ...s, [key]: val }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações do Site</h1>
        <button className={styles.saveBtn} onClick={saveSettings} disabled={saving}>
          {saving ? 'Salvando…' : saved ? '✓ Salvo!' : 'Salvar tudo'}
        </button>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Logo / Marca</h2>
        <div className={styles.logoRow}>
          {settings.site_logo
            ? <img src={settings.site_logo} alt="logo" className={styles.logoPreview} />
            : <div className={styles.logoPlaceholder}>SEM LOGO</div>}
          <div>
            <button className={styles.uploadBtn} onClick={() => logoRef.current?.click()} disabled={uploadingLogo}>
              {uploadingLogo ? 'Enviando…' : settings.site_logo ? 'Trocar logo' : 'Enviar logo'}
            </button>
            {settings.site_logo && (
              <button className={styles.removeBtn} onClick={() => set('site_logo', '')}>Remover</button>
            )}
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
            <p className={styles.hint}>PNG ou SVG com fundo transparente. Aparece no topo do site.</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Perfil do Autor</h2>
        <div className={styles.authorRow}>
          <div className={styles.avatarWrap}>
            {authorAvatar ? <img src={authorAvatar} alt="foto" className={styles.avatar} /> : <div className={styles.avatarPlaceholder}>{authorName?.[0] || '?'}</div>}
            <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Enviando…' : 'Trocar foto'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
          </div>
          <div className={styles.authorFields}>
            <label className={styles.field}>
              <span>Nome</span>
              <input value={authorName} onChange={e => setAuthorName(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Cargo / Função</span>
              <input value={authorRole} onChange={e => setAuthorRole(e.target.value)} placeholder="ex: CRONISTA-CHEFE · HOST DO PODFLAH" />
            </label>
            <label className={styles.field}>
              <span>Bio</span>
              <textarea value={authorBio} onChange={e => setAuthorBio(e.target.value)} rows={3} />
            </label>
            <label className={styles.field}>
              <span>Instagram (só o @)</span>
              <input value={authorInstagram} onChange={e => setAuthorInstagram(e.target.value)} placeholder="seuperfil" />
            </label>
            <label className={styles.field}>
              <span>YouTube (URL)</span>
              <input value={authorYoutube} onChange={e => setAuthorYoutube(e.target.value)} placeholder="https://youtube.com/@seucanal" />
            </label>
          </div>
        </div>
      </section>

      <div className={styles.footer}>
        <button className={styles.saveBtn} onClick={saveSettings} disabled={saving}>
          {saving ? 'Salvando…' : saved ? '✓ Salvo!' : 'Salvar tudo'}
        </button>
      </div>
    </div>
  );
}
