import { getCars, getSettings } from '@/lib/db';
import SiteHeader from '@/components/SiteHeader';
import CarsGrid from '@/components/CarsGrid';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { IconCheck } from '@/lib/icons';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [cars, settings] = await Promise.all([getCars(), getSettings()]);

  return (
    <>
      <SiteHeader settings={settings} />

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow-line">
              <span className="dash"></span>
              <span>Loja de seminovos em Belém do Pará</span>
            </div>
            <h1 className="hero-title">
              Seu próximo
              <br />
              carro está <em>bem</em>
              <br />
              aqui na VCar.
            </h1>
            <p className="hero-sub">
              Carros revisados, com procedência verificada e negociação sem enrolação. Atendimento direto com quem
              cuida do seu carro do início ao fim.
            </p>
            <div className="hero-actions">
              <a href="#estoque" className="btn btn-yellow">Ver estoque completo</a>
              <a href="#contato" className="btn btn-outline">Falar com um vendedor</a>
            </div>
            <div className="hero-stats">
              <div>
                <div className="stat-num">{cars.length}</div>
                <div className="stat-label">Carros no estoque</div>
              </div>
              <div>
                <div className="stat-num">12</div>
                <div className="stat-label">Anos de mercado em Belém</div>
              </div>
              <div>
                <div className="stat-num">4.8</div>
                <div className="stat-label">Avaliação média dos clientes</div>
              </div>
            </div>
          </div>

          <div className="hero-side">
            <h3>Por que comprar com a gente</h3>
            <ul>
              <li><IconCheck /> Todo carro passa por vistoria antes de ir pro estoque.</li>
              <li><IconCheck /> Financiamento facilitado, com ou sem entrada.</li>
              <li><IconCheck /> Aceitamos seu carro usado na troca.</li>
              <li><IconCheck /> Garantia de 90 dias em todos os veículos.</li>
            </ul>
            <a href="#contato" className="btn btn-yellow" style={{ width: '100%' }}>Agendar visita</a>
          </div>
        </div>
      </section>

      <section className="section" id="estoque">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="section-tag">Estoque</span>
              <h2>Carros disponíveis agora</h2>
              <p>Atualizamos o estoque toda semana. Se não achar o que procura, fale com a gente — a gente busca.</p>
            </div>
          </div>
          <CarsGrid cars={cars} settings={settings} />
        </div>
      </section>

      <section className="section" id="diferenciais">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="section-tag">Como funciona</span>
              <h2>Do primeiro contato até as chaves na mão</h2>
            </div>
          </div>
          <div className="diff-list">
            <div className="diff-item">
              <div className="num">01</div>
              <h4>Você escolhe o carro</h4>
              <p>No site ou visitando a loja. Fotos reais, quilometragem e valor sempre atualizados.</p>
            </div>
            <div className="diff-item">
              <div className="num">02</div>
              <h4>A gente confere tudo com você</h4>
              <p>Test-drive, revisão dos documentos e checklist mecânico, sem pressa.</p>
            </div>
            <div className="diff-item">
              <div className="num">03</div>
              <h4>Fechamos do seu jeito</h4>
              <p>À vista, financiado ou com seu usado na troca. Você sai de carro no mesmo dia.</p>
            </div>
          </div>
        </div>
      </section>

      <ContactSection settings={settings} />
      <Footer settings={settings} />
    </>
  );
}
