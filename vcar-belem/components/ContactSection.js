import { formatWhatsDisplay, waLink } from '@/lib/format';
import { IconPhone, IconWhats, IconMail, IconPin, IconClock, IconInsta, IconFb } from '@/lib/icons';

function Row({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="contact-row">
      <div className="ic">{icon}</div>
      <div>
        <div className="label">{label}</div>
        <div className="val">{value}</div>
      </div>
    </div>
  );
}

export default function ContactSection({ settings }) {
  const wa = waLink(settings.whatsapp, 'Olá! Vim pelo site da VCar Belém e queria mais informações.');

  return (
    <section className="section" id="contato">
      <div className="wrap contact-grid">
        <div>
          <span className="section-tag">Fale com a gente</span>
          <h2>Visite a loja ou chame no WhatsApp</h2>
          <div className="contact-list">
            <Row icon={<IconPhone />} label="Telefone" value={settings.phone} />
            <Row icon={<IconWhats />} label="WhatsApp" value={settings.whatsapp ? formatWhatsDisplay(settings.whatsapp) : ''} />
            <Row icon={<IconMail />} label="E-mail" value={settings.email} />
            <Row icon={<IconPin />} label="Endereço" value={settings.address} />
            <Row icon={<IconClock />} label="Horário" value={settings.hours} />
          </div>
          <div className="social-row">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <IconInsta />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <IconFb />
              </a>
            )}
          </div>
        </div>

        <div className="contact-panel">
          <h3>Quer um carro específico?</h3>
          <p>
            Conta pra gente o que você procura — modelo, ano, faixa de preço — que a nossa equipe já te chama com
            opções do estoque ou de parceiros.
          </p>
          <a href={wa} className="btn btn-yellow" target="_blank" rel="noopener noreferrer" style={{ width: '100%', marginBottom: 12 }}>
            Chamar no WhatsApp
          </a>
          <a href={`mailto:${settings.email || ''}`} className="btn btn-outline" style={{ width: '100%' }}>
            Enviar e-mail
          </a>
        </div>
      </div>
    </section>
  );
}
