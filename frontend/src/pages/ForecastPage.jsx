import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth'
import PriceChart from '../components/PriceChart'
import { IconArrowLeft, IconBell, IconCheck } from '../components/Icons'
import {
  buildForecast,
  formatDayMonth,
  formatLongDate,
  formatPrice,
  formatSignedPrice,
  routeTitle,
} from '../data'

export default function ForecastPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const from = params.get('from') || 'SVO'
  const to = params.get('to') || 'AER'
  const date = params.get('date') || '2026-11-24'
  const forecast = useMemo(() => buildForecast(from, to, date), [from, to, date])

  useEffect(() => {
    document.title = `${routeTitle(from, to)} · вовремя`
  }, [from, to])

  const delta = forecast.expected - forecast.current
  const subscribeUrl = `/routes/new?from=${from}&to=${to}&date=${date}&target=${Math.max(forecast.current - 500, 1000)}`
  const formula = `${new Intl.NumberFormat('ru-RU').format(forecast.base)} ${forecast.factors
    .map((factor) => `${factor.value >= 0 ? '+' : '−'} ${new Intl.NumberFormat('ru-RU').format(Math.abs(factor.value))}`)
    .join(' ')} = ${formatPrice(forecast.expected)}`

  function watch(event) {
    if (user) return
    event.preventDefault()
    navigate(`/login?next=${encodeURIComponent(subscribeUrl)}`)
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <IconArrowLeft size={16} /> Изменить поиск
      </Link>
      <div className="page-title-row">
        <div>
          <h1>{routeTitle(from, to)}</h1>
          <p className="lede">
            {from} → {to} · {formatLongDate(date)} · в одну сторону · 1 пассажир
          </p>
        </div>
        <Link to={user ? subscribeUrl : `/login?next=${encodeURIComponent(subscribeUrl)}`} className="btn btn-ghost" onClick={watch}>
          Следить за ценой <IconBell size={16} />
        </Link>
      </div>

      <section className="forecast-summary">
        <article className="panel price-panel">
          <p className="panel-kicker">Ожидаемая цена через 7 дней</p>
          <div className="price-line">
            <strong>{formatPrice(forecast.expected)}</strong>
            <span>
              {formatSignedPrice(delta)} к текущей
            </span>
          </div>
          <p className="muted">
            На {formatDayMonth(forecast.horizonDate)} · 80%-й интервал:{' '}
            {formatPrice(forecast.low).replace(' ₽', '')}–{formatPrice(forecast.high)}
          </p>
        </article>
        <article className={`panel advice-panel ${forecast.rec === 'buy' ? 'is-buy' : 'is-wait'}`}>
          <h2>
            {forecast.rec === 'buy' ? (
              <>
                <IconCheck size={18} /> Покупать сейчас
              </>
            ) : (
              'Подождать'
            )}
          </h2>
          <p>
            {forecast.rec === 'buy'
              ? `Сейчас билет стоит ${formatPrice(forecast.current)}. Модель ожидает рост цены в ближайшую неделю: текущая цена ниже прогнозного диапазона.`
              : `Сейчас билет стоит ${formatPrice(forecast.current)}. Модель ожидает, что в ближайшую неделю цена будет ниже или останется близко к текущей — спешить не обязательно.`}
          </p>
          <small>Оценка, не гарантия · Обновлено {forecast.updatedAt}</small>
        </article>
      </section>

      <section className="forecast-body">
        <article className="panel chart-panel">
          <div className="chart-head">
            <div>
              <h2>Как менялась цена</h2>
              <div className="legend">
                <span><i className="swatch history" /> История</span>
                <span><i className="swatch future" /> Прогноз на 7 дней</span>
                <span><i className="swatch band" /> Диапазон 80%</span>
              </div>
            </div>
            <span className="chip">Последние 30 дней</span>
          </div>
          <PriceChart forecast={forecast} />
          <p className="chart-caption">
            Минимальная найденная цена за день · 1 пассажир, эконом, без багажа. Светлая область — 80%-й прогнозный интервал, не гарантия цены.
          </p>
        </article>
        <article className="panel watch-panel">
          <IconBell />
          <h2>Не готовы покупать? Останемся на связи.</h2>
          <p>Укажите комфортную цену — пришлём письмо, если билет станет дешевле. Подписка бесплатная.</p>
          <Link to={user ? subscribeUrl : `/login?next=${encodeURIComponent(subscribeUrl)}`} className="btn btn-primary" onClick={watch}>
            Настроить уведомление
          </Link>
          <small>Мы не продаём билеты и не влияем на тарифы авиакомпаний. Вы сами решаете, когда покупать.</small>
        </article>
      </section>

      <section className="explain">
        <div className="section-head">
          <h2>Почему такой прогноз?</h2>
          <span className="muted">Объясняем модель · SHAP</span>
        </div>
        <div className="explain-grid">
          <article className="panel">
            <div className="shap-scale">
              <span>Вклад в ожидаемую цену на {formatDayMonth(forecast.horizonDate)}, ₽</span>
              <span className="shap-legend">
                <i className="down" /> Снижают
                <i className="up" /> Повышают
              </span>
            </div>
            <ul className="shap-list">
              {forecast.factors.map((factor) => (
                <li key={factor.title}>
                  <div>
                    <strong>{factor.title}</strong>
                    <span>{factor.note}</span>
                  </div>
                  <div className="shap-track" aria-hidden="true">
                    <span
                      className={factor.value >= 0 ? 'is-up' : 'is-down'}
                      style={{
                        width: `${Math.min(Math.abs(factor.value) / 1000, 1) * 46}%`,
                        marginLeft: factor.value >= 0 ? '50%' : `${50 - Math.min(Math.abs(factor.value) / 1000, 1) * 46}%`,
                      }}
                    />
                  </div>
                  <em className={factor.value >= 0 ? 'is-up' : 'is-down'}>{formatSignedPrice(factor.value)}</em>
                </li>
              ))}
            </ul>
            <div className="shap-axis" aria-hidden="true">
              <span>−1 000 ₽</span>
              <span>0</span>
              <span>+1 000 ₽</span>
            </div>
          </article>
          <article className="panel box-note">
            <h3>Не чёрный ящик</h3>
            <p>
              Полосы показывают, насколько каждый фактор сдвигает оценку относительно базовой цены модели — {formatPrice(forecast.base)}.
            </p>
            <p className="formula">{formula}</p>
            <small>Это вклад в оценку модели, а не доказательство причин изменения цены.</small>
          </article>
        </div>
      </section>
    </div>
  )
}
