'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CAR_PLACEHOLDER_SVG } from '@/lib/constants';
import { formatBRL, formatKm } from '@/lib/format';
import { IconEdit, IconTrash, IconUpload } from '@/lib/icons';

const EMPTY_CAR = {
  name: '', brand: '', year: '', price: '', km: '',
  transmission: 'Manual', fuel: 'Flex', color: '', description: '',
  featured: false, photo_url: null,
};

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    fetch('/api/session')
      .then((r) => r.json())
      .then((d) => {
        setIsAdmin(!!d.isAdmin);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  async function doLogin(e) {
    e.preventDefault();
    setLoginErr('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) setIsAdmin(true);
      else setLoginErr(data.error || 'Senha incorreta.');
    } catch {
      setLoginErr('Não foi possível entrar. Tente novamente.');
    } finally {
      setLoggingIn(false);
    }
  }

  async function doLogout() {
    await fetch('/api/logout', { method: 'POST' });
    setIsAdmin(false);
  }

  if (checking) return <div className="admin-loading">Carregando…</div>;

  if (!isAdmin) {
    return (
      <div className="admin-login-wrap">
        <form className="modal" onSubmit={doLogin} style={{ position: 'static' }}>
          <h3>Painel administrativo</h3>
          <p className="sub">Entre com a senha para gerenciar o estoque, a logo e os contatos.</p>
          <div className="field">
            <label htmlFor="loginPass">Senha</label>
            <input
              id="loginPass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {loginErr && <div className="hint-err">{loginErr}</div>}
          <button className="btn btn-yellow" style={{ width: '100%' }} type="submit" disabled={loggingIn}>
            {loggingIn ? 'Entrando…' : 'Entrar'}
          </button>
          <p className="sub" style={{ marginTop: 16 }}>
            <Link href="/" style={{ color: 'var(--yellow)', textDecoration: 'none' }}>&larr; Voltar ao site</Link>
          </p>
        </form>
      </div>
    );
  }

  return <AdminDashboard onLogout={doLogout} />;
}

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('estoque');
  const [toast, setToast] = useState('');

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-brand">VCar <span>Admin</span></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/" className="btn btn-outline btn-small">Ver site</Link>
          <button className="btn btn-outline btn-small" onClick={onLogout}>Sair</button>
        </div>
      </div>
      <div className="admin-page-body">
        <div className="admin-side">
          <button className={`admin-tab${tab === 'estoque' ? ' active' : ''}`} onClick={() => setTab('estoque')}>Estoque</button>
          <button className={`admin-tab${tab === 'loja' ? ' active' : ''}`} onClick={() => setTab('loja')}>Logo &amp; loja</button>
          <button className={`admin-tab${tab === 'contato' ? ' active' : ''}`} onClick={() => setTab('contato')}>Contatos</button>
        </div>
        <div className="admin-main">
          {tab === 'estoque' && <EstoqueTab notify={notify} />}
          {tab === 'loja' && <LojaTab notify={notify} />}
          {tab === 'contato' && <ContatoTab notify={notify} />}
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ---------------- ESTOQUE ---------------- */

function EstoqueTab({ notify }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/cars')
      .then((r) => r.json())
      .then((d) => {
        setCars(d.cars || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm('Excluir este carro do estoque?')) return;
    const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notify('Carro removido.');
      load();
    } else {
      notify('Não foi possível excluir.');
    }
  }

  return (
    <div>
      <h3>Gerenciar estoque</h3>
      <p className="sub">Adicione, edite ou remova carros. As mudanças aparecem no site na hora.</p>
      <button
        className="btn btn-yellow btn-small"
        style={{ marginBottom: 20 }}
        onClick={() => { setEditing(null); setFormOpen(true); }}
      >
        + Adicionar carro
      </button>

      {loading ? (
        <p className="sub">Carregando…</p>
      ) : cars.length === 0 ? (
        <p className="sub">Nenhum carro cadastrado ainda.</p>
      ) : (
        cars.map((car) => (
          <div className="car-row-admin" key={car.id}>
            <img src={car.photo_url || CAR_PLACEHOLDER_SVG} alt="" />
            <div className="info">
              <b>{car.brand} {car.name}</b>
              <span>{car.year} · {formatBRL(car.price)} · {formatKm(car.km)}</span>
            </div>
            <div className="actions">
              <button className="icon-btn" title="Editar" onClick={() => { setEditing(car); setFormOpen(true); }}>
                <IconEdit />
              </button>
              <button className="icon-btn del" title="Excluir" onClick={() => handleDelete(car.id)}>
                <IconTrash />
              </button>
            </div>
          </div>
        ))
      )}

      {formOpen && (
        <CarFormModal
          car={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
            notify(editing ? 'Carro atualizado.' : 'Carro adicionado ao estoque.');
          }}
        />
      )}
    </div>
  );
}

function CarFormModal({ car, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    car
      ? {
          name: car.name, brand: car.brand, year: car.year, price: car.price, km: car.km,
          transmission: car.transmission, fuel: car.fuel, color: car.color || '',
          description: car.description || '', featured: !!car.featured, photo_url: car.photo_url || null,
        }
      : { ...EMPTY_CAR }
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha no upload.');
      set('photo_url', data.url);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!form.name || !form.brand) { setErr('Preencha ao menos marca e modelo.'); return; }
    if (!form.price || Number(form.price) <= 0) { setErr('Informe um valor válido.'); return; }
    if (!form.year) { setErr('Informe o ano.'); return; }

    setSaving(true);
    const payload = {
      ...form,
      year: parseInt(form.year, 10),
      price: parseFloat(form.price),
      km: parseFloat(form.km) || 0,
    };
    try {
      const res = await fetch(car ? `/api/cars/${car.id}` : '/api/cars', {
        method: car ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || 'Não foi possível salvar.');
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <button className="close-x" onClick={onClose} type="button">&times;</button>
        <h3>{car ? 'Editar carro' : 'Adicionar carro'}</h3>
        <p className="sub">Preencha os dados do veículo.</p>

        <form onSubmit={handleSubmit}>
          {form.photo_url && <img className="upload-preview" src={form.photo_url} alt="" />}
          <label className="upload-zone" htmlFor="carFile">
            <IconUpload />
            <span>{uploading ? 'Enviando…' : 'Clique para enviar a foto do carro'}</span>
          </label>
          <input id="carFile" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

          <div className="field" style={{ marginTop: 18 }}>
            <label htmlFor="carName">Modelo</label>
            <input id="carName" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Toro Freedom 1.8" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="carBrand">Marca</label>
              <input id="carBrand" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Ex: Fiat" />
            </div>
            <div className="field">
              <label htmlFor="carYear">Ano</label>
              <input id="carYear" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} min="1970" max="2030" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="carPrice">Valor (R$)</label>
              <input id="carPrice" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="carKm">Quilometragem</label>
              <input id="carKm" type="number" value={form.km} onChange={(e) => set('km', e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="carTransmission">Câmbio</label>
              <select id="carTransmission" value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
                <option value="Manual">Manual</option>
                <option value="Automático">Automático</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="carFuel">Combustível</label>
              <select id="carFuel" value={form.fuel} onChange={(e) => set('fuel', e.target.value)}>
                <option>Flex</option>
                <option>Gasolina</option>
                <option>Diesel</option>
                <option>Híbrido</option>
                <option>Elétrico</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="carColor">Cor</label>
            <input id="carColor" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Ex: Branco" />
          </div>
          <div className="field">
            <label htmlFor="carDesc">Descrição (opcional)</label>
            <textarea id="carDesc" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: 'row' }}>
            <input type="checkbox" id="carFeatured" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} style={{ width: 'auto' }} />
            <label htmlFor="carFeatured" style={{ margin: 0 }}>Marcar como destaque</label>
          </div>
          {err && <div className="hint-err">{err}</div>}
          <div className="form-actions">
            <button className="btn btn-yellow" style={{ flex: 1 }} type="submit" disabled={saving || uploading}>
              {saving ? 'Salvando…' : 'Salvar carro'}
            </button>
            <button className="btn btn-outline" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- LOGO / LOJA ---------------- */

function LojaTab({ notify }) {
  const [settings, setSettings] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  if (!settings) return <p className="sub">Carregando…</p>;

  async function persist(next) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    return res.ok;
  }

  async function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const next = { ...settings, logo_url: data.url };
      setSettings(next);
      const ok = await persist(next);
      notify(ok ? 'Logo atualizada.' : 'Não foi possível salvar.');
    } catch (e2) {
      notify(e2.message || 'Falha ao enviar a logo.');
    } finally {
      setUploading(false);
    }
  }

  async function removeLogo() {
    const next = { ...settings, logo_url: null };
    setSettings(next);
    const ok = await persist(next);
    notify(ok ? 'Logo removida.' : 'Não foi possível salvar.');
  }

  async function saveSiteName() {
    const ok = await persist(settings);
    notify(ok ? 'Nome da loja atualizado.' : 'Não foi possível salvar.');
  }

  return (
    <div>
      <h3>Logo e identidade</h3>
      <p className="sub">Envie a logo da loja (PNG com fundo transparente funciona melhor).</p>

      {settings.logo_url && <img className="upload-preview" src={settings.logo_url} alt="" />}
      <label className="upload-zone" htmlFor="logoFile">
        <IconUpload />
        <span>{uploading ? 'Enviando…' : 'Clique para enviar a logo (PNG, JPG ou SVG)'}</span>
      </label>
      <input id="logoFile" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />

      <div className="form-actions">
        <button className="btn btn-outline btn-small" type="button" onClick={removeLogo}>Remover logo</button>
      </div>

      <div className="field" style={{ marginTop: 28, maxWidth: 440 }}>
        <label htmlFor="siteNameInput">Nome da loja (aparece no cabeçalho, se não houver logo)</label>
        <input
          id="siteNameInput"
          value={settings.site_name || ''}
          onChange={(e) => setSettings((s) => ({ ...s, site_name: e.target.value }))}
          onBlur={saveSiteName}
        />
      </div>
    </div>
  );
}

/* ---------------- CONTATO ---------------- */

function ContatoTab({ notify }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  if (!settings) return <p className="sub">Carregando…</p>;

  function set(k, v) { setSettings((s) => ({ ...s, [k]: v })); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      notify(res.ok ? 'Contatos atualizados.' : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 560 }}>
      <h3>Informações de contato</h3>
      <p className="sub">Essas informações aparecem na página inicial, na seção de contato.</p>

      <div className="field-row">
        <div className="field">
          <label htmlFor="cPhone">Telefone</label>
          <input id="cPhone" value={settings.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="(91) 3000-0000" />
        </div>
        <div className="field">
          <label htmlFor="cWhats">WhatsApp (só números, com DDD)</label>
          <input id="cWhats" value={settings.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value.replace(/\D/g, ''))} placeholder="5591999999999" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="cEmail">E-mail</label>
        <input id="cEmail" type="email" value={settings.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="contato@vcarbelem.com.br" />
      </div>
      <div className="field">
        <label htmlFor="cAddress">Endereço</label>
        <input id="cAddress" value={settings.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Av. Exemplo, 1234 — Marco, Belém - PA" />
      </div>
      <div className="field">
        <label htmlFor="cHours">Horário de funcionamento</label>
        <input id="cHours" value={settings.hours || ''} onChange={(e) => set('hours', e.target.value)} placeholder="Seg a sáb, 8h às 18h" />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="cInstagram">Instagram (link completo)</label>
          <input id="cInstagram" value={settings.instagram || ''} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/vcarbelem" />
        </div>
        <div className="field">
          <label htmlFor="cFacebook">Facebook (link completo)</label>
          <input id="cFacebook" value={settings.facebook || ''} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/vcarbelem" />
        </div>
      </div>
      <button className="btn btn-yellow" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar contatos'}</button>
    </form>
  );
}
