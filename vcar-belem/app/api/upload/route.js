import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Armazenamento de imagens (Vercel Blob) não configurado. Conecte o Storage > Blob ao projeto na Vercel.' },
      { status: 500 }
    );
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }
  if (!file.type || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Envie um arquivo de imagem.' }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagem muito grande (máximo 8MB).' }, { status: 400 });
  }

  try {
    const blob = await put(file.name || 'imagem', file, {
      access: 'public',
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao enviar a imagem.' }, { status: 500 });
  }
}
