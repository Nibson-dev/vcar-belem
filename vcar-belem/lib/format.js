export function formatBRL(v) {
  const n = Number(v) || 0;
  return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

export function formatKm(v) {
  const n = Number(v) || 0;
  return n.toLocaleString('pt-BR') + ' km';
}

export function formatWhatsDisplay(w) {
  const digits = String(w || '').replace(/\D/g, '');
  if (digits.length >= 12) {
    return '+' + digits.slice(0, 2) + ' (' + digits.slice(2, 4) + ') ' + digits.slice(4, 9) + '-' + digits.slice(9);
  }
  return w;
}

export function waLink(whatsapp, text) {
  const digits = String(whatsapp || '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
