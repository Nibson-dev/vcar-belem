'use client';

import { useState } from 'react';
import { waLink } from '@/lib/format';
import { IconMenu } from '@/lib/icons';

export function Logo({ settings }) {
  const name = (settings && settings.site_name) || 'VCar Belém';
  if (settings && settings.logo_url) {
    return (
      <div className="logo-slot">
        <img src={settings.logo_url} alt={`Logo ${name}`} />
      </div>
    );
  }
  return (
    <div className="logo-slot">
      <div className="logo-mark">V</div>
      <div className="logo-text">
        {name}
        <small>SEMINOVOS &amp; USADOS</small>
      </div>
    </div>
  );
}

export default function SiteHeader({ settings }) {
  const [open, setOpen] = useState(false);
  const wa = waLink(settings.whatsapp, 'Olá! Vim pelo site da VCar Belém e queria mais informações.');

  return (
    <header className="site">
      <div className="wrap header-row">
        <Logo settings={settings} />
        <nav className={`main${open ? ' open' : ''}`}>
          <a href="#estoque" onClick={() => setOpen(false)}>Estoque</a>
          <a href="#diferenciais" onClick={() => setOpen(false)}>Por que a VCar</a>
          <a href="#contato" onClick={() => setOpen(false)}>Contato</a>
        </nav>
        <div className="header-cta">
          <a className="btn btn-yellow btn-small" href={wa} target="_blank" rel="noopener noreferrer">
            Chamar no WhatsApp
          </a>
          <button className="menu-toggle" aria-label="Abrir menu" onClick={() => setOpen((o) => !o)}>
            <IconMenu />
          </button>
        </div>
      </div>
    </header>
  );
}
