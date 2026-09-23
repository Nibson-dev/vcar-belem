import { neon } from '@neondatabase/serverless';
import { unstable_noStore as noStore } from 'next/cache';

// A conexão só é criada quando a primeira query roda (nunca no carregamento do
// módulo), para que `next build` não quebre antes das variáveis de ambiente existirem.
// A integração "Postgres" da Vercel (via Neon) expõe a URL em DATABASE_URL ou
// POSTGRES_URL, dependendo de como foi criada.
let sqlClient;

function sql(strings, ...values) {
  if (!sqlClient) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      throw new Error(
        'Nenhuma variável de ambiente de banco de dados encontrada (DATABASE_URL ou POSTGRES_URL). Conecte um Postgres ao projeto na Vercel.'
      );
    }

    sqlClient = neon(connectionString);
  }

  return sqlClient(strings, ...values);
}

let schemaReady;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          id INT PRIMARY KEY DEFAULT 1,
          site_name TEXT DEFAULT 'VCar Belém',
          logo_url TEXT,
          phone TEXT DEFAULT '',
          whatsapp TEXT DEFAULT '',
          email TEXT DEFAULT '',
          address TEXT DEFAULT '',
          hours TEXT DEFAULT '',
          instagram TEXT DEFAULT '',
          facebook TEXT DEFAULT ''
        );
      `;

      await sql`
        INSERT INTO settings (
          id,
          site_name,
          phone,
          whatsapp,
          email,
          address,
          hours
        )
        VALUES (
          1,
          'VCar Belém',
          '(91) 3222-1010',
          '5591988887777',
          'contato@vcarbelem.com.br',
          'Av. Almirante Barroso, 2100 — Marco, Belém - PA',
          'Segunda a sábado, 8h às 18h'
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS cars (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          year INT NOT NULL,
          price NUMERIC NOT NULL,
          km NUMERIC DEFAULT 0,
          transmission TEXT DEFAULT 'Manual',
          fuel TEXT DEFAULT 'Flex',
          color TEXT DEFAULT '',
          photo_url TEXT,
          photo_urls TEXT[] DEFAULT '{}',
          featured BOOLEAN DEFAULT false,
          description TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `;

      // Adiciona a nova coluna aos bancos que já possuem a tabela cars.
      await sql`
        ALTER TABLE cars
        ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';
      `;
    })();
  }

  return schemaReady;
}

export async function getSettings() {
  noStore();
  await ensureSchema();

  const rows = await sql`
    SELECT * FROM settings WHERE id = 1
  `;

  return rows[0];
}

export async function updateSettings(data) {
  await ensureSchema();

  const current = await getSettings();
  const merged = { ...current, ...data };

  const rows = await sql`
    UPDATE settings SET
      site_name = ${merged.site_name},
      logo_url = ${merged.logo_url},
      phone = ${merged.phone},
      whatsapp = ${merged.whatsapp},
      email = ${merged.email},
      address = ${merged.address},
      hours = ${merged.hours},
      instagram = ${merged.instagram},
      facebook = ${merged.facebook}
    WHERE id = 1
    RETURNING *;
  `;

  return rows[0];
}

export async function getCars() {
  noStore();
  await ensureSchema();

  const rows = await sql`
    SELECT * FROM cars
    ORDER BY created_at DESC
  `;

  return rows;
}

export async function getCar(id) {
  await ensureSchema();

  const rows = await sql`
    SELECT * FROM cars
    WHERE id = ${id}
  `;

  return rows[0];
}

export async function createCar(data) {
  await ensureSchema();

  const {
    name,
    brand,
    year,
    price,
    km = 0,
    transmission = 'Manual',
    fuel = 'Flex',
    color = '',
    photo_url = null,
    photo_urls = [],
    featured = false,
    description = ''
  } = data;

  const rows = await sql`
    INSERT INTO cars (
      name,
      brand,
      year,
      price,
      km,
      transmission,
      fuel,
      color,
      photo_url,
      photo_urls,
      featured,
      description
    )
    VALUES (
      ${name},
      ${brand},
      ${year},
      ${price},
      ${km},
      ${transmission},
      ${fuel},
      ${color},
      ${photo_url},
      ${photo_urls},
      ${featured},
      ${description}
    )
    RETURNING *;
  `;

  return rows[0];
}

export async function updateCar(id, data) {
  await ensureSchema();

  const current = await getCar(id);

  if (!current) return null;

  const merged = { ...current, ...data };

  const rows = await sql`
    UPDATE cars SET
      name = ${merged.name},
      brand = ${merged.brand},
      year = ${merged.year},
      price = ${merged.price},
      km = ${merged.km},
      transmission = ${merged.transmission},
      fuel = ${merged.fuel},
      color = ${merged.color},
      photo_url = ${merged.photo_url},
      photo_urls = ${merged.photo_urls || []},
      featured = ${merged.featured},
      description = ${merged.description}
    WHERE id = ${id}
    RETURNING *;
  `;

  return rows[0];
}

export async function deleteCar(id) {
  await ensureSchema();

  await sql`
    DELETE FROM cars
    WHERE id = ${id}
  `;
}
