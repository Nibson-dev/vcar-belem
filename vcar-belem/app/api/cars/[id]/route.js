import { NextResponse } from 'next/server';
import { updateCar, deleteCar } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req, { params }) {
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
    const car = await updateCar(params.id, data);
    if (!car) return NextResponse.json({ error: 'Carro não encontrado.' }, { status: 404 });
    return NextResponse.json({ car });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível atualizar o carro.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  try {
    await deleteCar(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível excluir o carro.' }, { status: 500 });
  }
}
