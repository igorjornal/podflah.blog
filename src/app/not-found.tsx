import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <div className="wrap">
          <div className={styles.container}>
            <div className={styles.grid}>
              <div className={styles.bigNum}>404</div>
              <div className={styles.content}>
                <div className={styles.stamp}>IMPEDIMENTO!</div>
                <h1 className={styles.heading}>Essa página <em>não existe</em></h1>
                <p className={styles.desc}>
                  O árbitro marcou falta — a URL que você tentou acessar não foi encontrada. Pode ter sido movida, excluída ou você digitou o endereço errado.
                </p>
                <div className={styles.actions}>
                  <Link href="/" className="btn btn-primary">← VOLTAR PARA HOME</Link>
                  <Link href="/arquivo" className="btn btn-ghost">VER ARQUIVO</Link>
                </div>
                <form className={styles.searchForm} action="/arquivo">
                  <input name="q" type="text" placeholder="Buscar no arquivo..." />
                  <button type="submit">BUSCAR</button>
                </form>
              </div>
            </div>

            <div className={styles.suggestions}>
              <h2>Talvez você queira</h2>
              <div className={styles.suggestGrid}>
                <Link href="/" className={styles.suggestCard}>
                  <div className={styles.suggestImg} />
                  <div className={styles.suggestBody}>
                    <span className="cat-chip">Blog</span>
                    <p>Página inicial com todos os posts</p>
                  </div>
                </Link>
                <Link href="/arquivo" className={styles.suggestCard}>
                  <div className={`${styles.suggestImg} ${styles.dark}`} />
                  <div className={styles.suggestBody}>
                    <span className="cat-chip black">Arquivo</span>
                    <p>Busque em todo o conteúdo publicado</p>
                  </div>
                </Link>
                <Link href="/autor/igor-schwansing" className={styles.suggestCard}>
                  <div className={`${styles.suggestImg} ${styles.red}`} />
                  <div className={styles.suggestBody}>
                    <span className="cat-chip red">Autor</span>
                    <p>Conheça o cronista do PodFlah</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
