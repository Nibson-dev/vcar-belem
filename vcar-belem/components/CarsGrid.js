'use client';

import { useMemo, useState } from 'react';
import { formatBRL, formatKm, waLink } from '@/lib/format';
import { CAR_PLACEHOLDER_SVG } from '@/lib/constants';

export default function CarsGrid({ cars, settings }) {
  const [sort, setSort] = useState('recent');

  const sorted = useMemo(() => {
    const list = [...cars];
    if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'yearDesc') list.sort((a, b) => b.year - a.year);
    return list;
  }, [cars, sort]);

  return (
    <>
      <div className="toolbar">
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Mais recentes</option>
          <option value="priceAsc">Menor preço</option>
          <option value="priceDesc">Maior preço</option>
          <option value="yearDesc">Ano mais novo</option>
        </select>
      </div>

      <div className="cars-grid">
        {sorted.length === 0 && (
          <div className="empty-state">
            <h3>Nenhum carro no estoque ainda</h3>
            <p>Assim que o admin adicionar veículos, eles aparecem aqui.</p>
          </div>
        )}

        {sorted.map((car) => {
          const wa = waLink(
            settings.whatsapp,
            `Olá! Tenho interesse no ${car.brand} ${car.name} (${car.year}) anunciado no site da VCar Belém.`
          );
          return (
            <div className="car-card" key={car.id}>
              <div className="car-photo">
                <img src={car.photo_url || CAR_PLACEHOLDER_SVG} alt={`${car.brand} ${car.name}`} loading="lazy" />
                {car.featured && <div className="featured-flag">Destaque</div>}
                <div className="price-tag">{formatBRL(car.price)}</div>
              </div>
              <div className="car-body">
                <div className="brand">{car.brand}</div>
                <h3>{car.name}</h3>
                <div className="spec-row">
                  <div><b>{car.year}</b>Ano</div>
                  <div><b>{formatKm(car.km)}</b>Rodados</div>
                  <div><b>{car.transmission}</b>Câmbio</div>
                </div>
                <div className="car-actions">
                  <a className="btn btn-yellow btn-small" target="_blank" rel="noopener noreferrer" href={wa}>
                    Tenho interesse
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
