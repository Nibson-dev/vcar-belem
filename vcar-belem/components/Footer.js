import Link from 'next/link';
import { Logo } from './SiteHeader';

export default function Footer({ settings }) {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="footer-row">
          <Logo settings={settings} />
          <nav className="footer-nav">
            <a href="#estoque">Estoque</a>
            <a href="#diferenciais">Por que a VCar</a>
            <a href="#contato">Contato</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <small>
            © {new Date().getFullYear()} {settings.site_name || 'VCar Belém'}. Todos os direitos reservados.
          </small>
          <Link href="/admin" className="admin-link">
            Painel administrativo
          </Link>
        </div>
      </div>
    </footer>
  );
}
