'use client';
import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const result = await signIn('credentials', {
      username: data.get('username'),
      password: data.get('password'),
      redirect: false,
    });
    if (result?.ok) {
      router.push('/admin');
    } else {
      setError('Usuário ou senha incorretos.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.mark}>P</div>
          <div>
            <div className={styles.brandName}>PODFLAH</div>
            <div className={styles.brandSub}>admin</div>
          </div>
        </div>

        <h1 className={styles.heading}>Acesso <em>restrito</em></h1>
        <p className={styles.sub}>Entre com suas credenciais para acessar o painel.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Usuário</label>
            <input name="username" type="text" autoComplete="username" required />
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <input name="password" type="password" autoComplete="current-password" required />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'ENTRANDO...' : 'ENTRAR →'}
          </button>
        </form>
      </div>
    </div>
  );
}
