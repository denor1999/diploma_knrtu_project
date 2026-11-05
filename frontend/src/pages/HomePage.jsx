import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { CalendarField, SelectField } from '../components/Fields'
import { IconArrowRight, IconBell, IconCheck, IconInfo, IconSliders, IconSwap, IconTrend } from '../components/Icons'
import { buildForecast, destinationLabel, formatPrice, getPlace, originLabel, places, popularRoutes } from '../data'

export default function HomePage() {
  const navigate = useNavigate()
  const { recordSearch } = useAuth()
  const panelRef = useRef(null)
  const [from, setFrom] = useState('SVO')
  const [to, setTo] = useState('AER')
  const [date, setDate] = useState('2026-11-24')
  const [open, setOpen] = useState(null)

  useEffect(() => {
    document.title = 'Поиск · вовремя'
  }, [])

  useEffect(() => {
    function onPointerDown(event) {
      if (!panelRef.current?.contains(event.target)) setOpen(null)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const destinations = places.filter((place) => place.code !== from)
  const moscowAirports = places.filter((place) => place.group === 'moscow')
  const otherPlaces = places.filter((place) => place.group === 'city' && place.code !== from)

  function toggle(name) {
    setOpen((current) => (current === name ? null : name))
  }

  function remember(nextFrom, nextTo, nextDate) {
    const quote = buildForecast(nextFrom, nextTo, nextDate)
    recordSearch({
      from: nextFrom,
      to: nextTo,
      date: nextDate,
      requestedLabel: 'Только что',
      price: quote.current,
      rec: quote.rec,
    })
  }

  function search(event) {
    event.preventDefault()
    remember(from, to, date)
    navigate(`/forecast?${new URLSearchParams({ from, to, date }).toString()}`)
  }

  function swap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Ваш ориентир в ценах на перелёты</p>
          <h1>
            Улететь выгоднее.
            <br />
            Поймать момент.
          </h1>
          <p className="lede">
            Покупать билет сейчас или немного подождать? Покажем прогноз цены и объясним, что на него влияет.
          </p>
        </div>
        <article className="hero-card">
          <img src="/photos/coast.jpg" alt="Побережье Чёрного моря" />
          <div className="hero-float">
            <div>
              <strong>Москва → Сочи</strong>
              <span>24 ноября · сейчас 8 400 ₽</span>
            </div>
            <span className="pill pill-buy">
              <IconCheck size={14} /> Покупать сейчас
            </span>
          </div>
        </article>
      </section>

      <form className={`search-panel ${open ? 'is-open' : ''}`} onSubmit={search} ref={panelRef}>
        <div className="search-head">
          <h2>Куда отправимся?</h2>
          <p>В одну сторону · 1 взрослый · эконом</p>
        </div>
        <div className="search-grid">
          <SelectField
            label="Откуда"
            valueLabel={originLabel(from)}
            open={open === 'from'}
            onToggle={() => toggle('from')}
          >
            <div className="popover place-pop" role="listbox" aria-label="Аэропорты Москвы">
              <p className="pop-caption">Аэропорты Москвы</p>
              {moscowAirports.map((place) => (
                <button
                  key={place.code}
                  type="button"
                  className={place.code === from ? 'is-active' : ''}
                  onClick={() => {
                    setFrom(place.code)
                    setOpen(null)
                  }}
                >
                  <span className="place-icon" aria-hidden="true">
                    ✈
                  </span>
                  <span>
                    <strong>{place.airport}</strong>
                    <small>Москва, Россия</small>
                  </span>
                  <em>{place.code}</em>
                </button>
              ))}
              {otherPlaces.length ? <p className="pop-caption">Другие города</p> : null}
              {otherPlaces.map((place) => (
                <button
                  key={`origin-${place.code}`}
                  type="button"
                  onClick={() => {
                    setFrom(place.code)
                    setOpen(null)
                  }}
                >
                  <span className="place-icon" aria-hidden="true">
                    ✈
                  </span>
                  <span>
                    <strong>{place.city}</strong>
                    <small>{place.airport}</small>
                  </span>
                  <em>{place.code}</em>
                </button>
              ))}
            </div>
          </SelectField>
          <button type="button" className="swap" aria-label="Поменять местами" onClick={swap}>
            <IconSwap />
          </button>
          <SelectField
            label="Куда"
            valueLabel={destinationLabel(to)}
            open={open === 'to'}
            onToggle={() => toggle('to')}
          >
            <div className="popover place-pop" role="listbox" aria-label="Куда">
              <p className="pop-caption">Направления</p>
              {destinations.map((place) => (
                <button
                  key={place.code}
                  type="button"
                  className={place.code === to ? 'is-active' : ''}
                  onClick={() => {
                    setTo(place.code)
                    setOpen(null)
                  }}
                >
                  <span className="place-icon" aria-hidden="true">
                    ✈
                  </span>
                  <span>
                    <strong>{place.city}</strong>
                    <small>{place.airport}</small>
                  </span>
                  <em>{place.code}</em>
                </button>
              ))}
            </div>
          </SelectField>
          <CalendarField
            label="Дата вылета"
            value={date}
            open={open === 'date'}
            onToggle={() => toggle('date')}
            onChange={(next) => {
              setDate(next)
              setOpen(null)
            }}
          />
          <button type="submit" className="btn btn-primary search-submit">
            Узнать прогноз <IconArrowRight size={16} />
          </button>
        </div>
        <div className="search-extra">
          <div className="search-note">
            <IconInfo />
            <div>
              <strong>Не просто цена. Понимание, что дальше.</strong>
              <p>История за месяц, оценка на 7 дней и понятная рекомендация — в одном месте.</p>
            </div>
          </div>
          <p className="search-disclaimer">
            <strong>Без регистрации</strong>
            Прогноз — оценка, а не гарантия. Цены авиакомпаний могут измениться в любой момент.
          </p>
        </div>
      </form>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Ближе, чем кажется</h2>
            <p>Популярные маршруты из Москвы · цены на 2 ноября</p>
          </div>
          <p className="section-aside">За 1 пассажира, без багажа</p>
        </div>
        <div className="route-cards">
          {popularRoutes.map((route) => (
            <article key={route.to} className="route-card">
              <Link
                to={`/forecast?from=${route.from}&to=${route.to}&date=${route.date}`}
                className="route-photo"
                onClick={() => remember(route.from, route.to, route.date)}
              >
                <img src={route.image} alt="" />
                <span>{route.tag}</span>
              </Link>
              <div className="route-card-body">
                <div>
                  <h3>{getPlace(route.to).city}</h3>
                  <p>
                    Из Москвы · {route.to} · 24 ноября
                  </p>
                </div>
                <div className="route-price">
                  <strong>от {formatPrice(route.price)}</strong>
                  <span>в одну сторону</span>
                </div>
              </div>
              <Link
                className="text-link"
                to={`/forecast?from=${route.from}&to=${route.to}&date=${route.date}`}
                onClick={() => remember(route.from, route.to, route.date)}
              >
                Когда покупать <IconArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-row">
        <article>
          <IconTrend />
          <div>
            <h3>Смотрим на динамику</h3>
            <p>Не только сегодняшнюю цену, но и её историю.</p>
          </div>
        </article>
        <article>
          <IconSliders />
          <div>
            <h3>Объясняем факторы</h3>
            <p>Сезон, спрос и время до вылета — без чёрного ящика.</p>
          </div>
        </article>
        <article>
          <IconBell />
          <div>
            <h3>Следим вместе с вами</h3>
            <p>Сообщим, когда цена достигнет вашей цели.</p>
          </div>
        </article>
      </section>
    </div>
  )
}
