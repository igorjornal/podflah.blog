import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.stripe} />
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <span className={styles.mark}>P</span>
            <span>
              PODFLAH
              <small>.blog</small>
            </span>
          </div>
          <p>Futebol com alma, crônica com raiva e amor. O Arquibancada é o espaço do PodFlah para tudo que não cabe em 20 minutos de podcast.</p>
          <div className={styles.social}>
            <a href="#">IG</a>
            <a href="#">FB</a>
            <a href="#">YT</a>
            <a href="#">TK</a>
          </div>
        </div>

        <div>
          <h4>Navegar</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/categoria/cronicas">Crônicas</Link></li>
            <li><Link href="/categoria/analise">Análise</Link></li>
            <li><Link href="/arquivo">Arquivo & Busca</Link></li>
            <li><Link href="/autor/igor-schwansing">Sobre o Autor</Link></li>
          </ul>
        </div>

        <div>
          <h4>Sobre</h4>
          <ul>
            <li><Link href="#">O PodFlah</Link></li>
            <li><Link href="#">Podcast</Link></li>
            <li><Link href="#">Newsletter</Link></li>
            <li><Link href="#">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul>
            <li><Link href="#">Política de Privacidade</Link></li>
            <li><Link href="#">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© {new Date().getFullYear()} PodFlah.blog · Todos os direitos reservados.</span>
          <Link href="/admin" className={styles.adminLink}>ADMIN</Link>
        </div>
      </div>
    </footer>
  );
}
