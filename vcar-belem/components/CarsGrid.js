```jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatBRL, formatKm, waLink } from '@/lib/format';
import { CAR_PLACEHOLDER_SVG } from '@/lib/constants';

function CarCarousel({ car }) {
  const photos = useMemo(() => {
    if (Array.isArray(car.photo_urls) && car.photo_urls.length > 0) {
      return car.photo_urls;
    }

    if (car.photo_url) {
      return [car.photo_url];
    }

    return [CAR_PLACEHOLDER_SVG];
  }, [car.photo_urls, car.photo_url]);

  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  const hasMultiple = photos.length > 1;

  /*
   * Garante que, caso o carro seja atualizado e a quantidade
   * de fotos diminua, o índice atual continue válido.
   */
  useEffect(() => {
    setCurrent((index) =>
      index >= photos.length ? 0 : index
    );
  }, [photos.length]);

  /*
   * Pré-carrega a próxima e a anterior.
   *
   * Assim, quando o usuário clicar na seta, a imagem tende
   * a aparecer muito mais rápido porque já estará no cache
   * do navegador.
   */
  useEffect(() => {
    if (!hasMultiple) return;

    const nextIndex =
      current === photos.length - 1 ? 0 : current + 1;

    const previousIndex =
      current === 0 ? photos.length - 1 : current - 1;

    const nextImage = new Image();
    nextImage.src = photos[nextIndex];

    const previousImage = new Image();
    previousImage.src = photos[previousIndex];
  }, [current, photos, hasMultiple]);

  function previous(e) {
    if (e) e.stopPropagation();

    setCurrent((index) =>
      index === 0 ? photos.length - 1 : index - 1
    );
  }

  function next(e) {
    if (e) e.stopPropagation();

    setCurrent((index) =>
      index === photos.length - 1 ? 0 : index + 1
    );
  }

  function handleTouchStart(e) {
    if (!hasMultiple) return;

    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (!hasMultiple || touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const difference = touchStart - touchEnd;

    // Ignora toques pequenos para não trocar a foto acidentalmente.
    if (Math.abs(difference) > 45) {
      if (difference > 0) {
        next();
      } else {
        previous();
      }
    }

    setTouchStart(null);
  }

  return (
    <div
      className="car-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        className="car-carousel-image"
        src={photos[current]}
        alt={`${car.brand} ${car.name}`}
        loading="lazy"
        draggable="false"
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            onClick={previous}
            aria-label="Foto anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            onClick={next}
            aria-label="Próxima foto"
          >
            ›
          </button>

          <div className="carousel-counter">
            {current + 1} / {photos.length}
          </div>

          <div className="carousel-dots">
            {photos.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`carousel-dot${
                  index === current ? ' active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(index);
                }}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CarsGrid({ cars, settings }) {
  const [sort, setSort] = useState('recent');

  const sorted = useMemo(() => {
    const list = [...cars];

    if (sort === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'yearDesc') {
      list.sort((a, b) => b.year - a.year);
    }

    return list;
  }, [cars, sort]);

  return (
    <>
      <div className="toolbar">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
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
            <p>
              Assim que o admin adicionar veículos, eles aparecem aqui.
            </p>
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
                <CarCarousel car={car} />

                {car.featured && (
                  <div className="featured-flag">
                    Destaque
                  </div>
                )}

                <div className="price-tag">
                  {formatBRL(car.price)}
                </div>
              </div>

              <div className="car-body">
                <div className="brand">{car.brand}</div>

                <h3>{car.name}</h3>

                <div className="spec-row">
                  <div>
                    <b>{car.year}</b>
                    Ano
                  </div>

                  <div>
                    <b>{formatKm(car.km)}</b>
                    Rodados
                  </div>

                  <div>
                    <b>{car.transmission}</b>
                    Câmbio
                  </div>
                </div>

                <div className="car-actions">
                  <a
                    className="btn btn-yellow btn-small"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={wa}
                  >
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
```
