import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível carregar as configurações.' }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  try {
    const settings = await updateSettings(data);
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível salvar as configurações.' }, { status: 500 });
  }
}
