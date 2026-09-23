import { NextResponse } from 'next/server';
import { getCars, createCar } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const cars = await getCars();
    return NextResponse.json({ cars });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível carregar o estoque. Verifique a conexão com o banco.' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  if (!data.name || !data.brand || !data.price || !data.year) {
    return NextResponse.json({ error: 'Preencha marca, modelo, ano e valor.' }, { status: 400 });
  }

  try {
    const car = await createCar(data);
    return NextResponse.json({ car });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível salvar o carro.' }, { status: 500 });
  }
}
