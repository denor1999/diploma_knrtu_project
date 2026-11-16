import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { CalendarField, SelectField, TextField } from '../components/Fields'
import { IconArrowLeft, IconBell, IconCheck, IconMail, IconPlane, IconSearch } from '../components/Icons'
import {
  buildForecast,
  destinationLabel,
  formatLongDate,
  formatPrice,
  getPlace,
  isEmail,
  originLabel,
  places,
} from '../data'

export default function SubscribePage() {
  const { user, addSubscription } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [from, setFrom] = useState(params.get('from') || 'SVO')
  const [to, setTo] = useState(params.get('to') || 'AER')
  const [date, setDate] = useState(params.get('date') || '2026-11-24')
  const [target, setTarget] = useState(params.get('target') || '7900')
  const [email, setEmail] = useState(user?.email ?? '')
  const [agree, setAgree] = useState(true)
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Новая подписка · вовремя'
  }, [])

  const quote = useMemo(() => buildForecast(from, to, date), [from, to, date])
  const targetNumber = Number(String(target).replace(/\s/g, ''))
  const gap = Number.isFinite(targetNumber) ? quote.current - targetNumber : 0

  if (!user) {
    const next = `/routes/new?${params.toString()}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }

  function submit(event) {
    event.preventDefault()
    if (!Number.isFinite(targetNumber) || targetNumber < 1000) {
      setError('Укажите целевую цену от 1 000 ₽.')
      return
    }
    if (!isEmail(email)) {
      setError('Проверьте адрес почты.')
      return
    }
    if (!agree) {
      setError('Подтвердите, что хотите получать письма по этому маршруту.')
      return
    }
    addSubscription({
      from,
      to,
      date,
      target: targetNumber,
      active: true,
      email: user.email,
    })
    navigate('/routes')
  }

  const moscow = places.filter((place) => place.group === 'moscow')
  const cities = places.filter((place) => place.group === 'city' && place.code !== from)

  return (
    <div className="page subscribe">
      <Link to="/routes" className="back-link">
        <IconArrowLeft size={16} /> Мои маршруты
      </Link>
      <div className="kicker-row">
        <span className="pill pill-buy">Бесплатно</span>
        <span className="muted">Уведомление о снижении цены</span>
      </div>
      <h1>Ваша цена. Наше уведомление.</h1>
      <p className="lede subscribe-lede">
        Задайте маршрут и комфортную стоимость — не нужно проверять билеты каждый день.
      </p>

      <div className="subscribe-grid">
        <form className="panel form-card" onSubmit={submit}>
          <fieldset>
            <legend><span>01</span> Куда летим</legend>
            <div className="form-grid">
              <SelectField label="Откуда" valueLabel={originLabel(from)} open={open === 'from'} onToggle={() => setOpen(open === 'from' ? null : 'from')}>
                <div className="popover place-pop">
                  {moscow.map((place) => (
                    <button key={place.code} type="button" className={place.code === from ? 'is-active' : ''} onClick={() => { setFrom(place.code); setOpen(null) }}>
                      <span><strong>{place.city} · {place.airport}</strong></span>
                      <em>{place.code}</em>
                    </button>
                  ))}
                </div>
              </SelectField>
              <SelectField label="Куда" valueLabel={destinationLabel(to)} open={open === 'to'} onToggle={() => setOpen(open === 'to' ? null : 'to')}>
                <div className="popover place-pop">
                  {cities.map((place) => (
                    <button key={place.code} type="button" className={place.code === to ? 'is-active' : ''} onClick={() => { setTo(place.code); setOpen(null) }}>
                      <span><strong>{place.city}</strong></span>
                      <em>{place.code}</em>
                    </button>
                  ))}
                </div>
              </SelectField>
              <CalendarField label="Дата вылета" value={date} open={open === 'date'} onToggle={() => setOpen(open === 'date' ? null : 'date')} onChange={(next) => { setDate(next); setOpen(null) }} />
              <label className="field">
                <span className="field-label">Пассажиры и класс</span>
                <span className="field-box is-static">1 взрослый · эконом</span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend><span>02</span> Какую цену ждём</legend>
            <div className="target-row">
              <TextField
                label="Уведомить, если цена не выше"
                value={target}
                onChange={setTarget}
                inputMode="numeric"
                suffix={<span className="suffix">₽</span>}
              />
              <div className="target-hint">
                <span>Сейчас: {formatPrice(quote.current)}</span>
                <strong className={gap > 0 ? 'is-down' : ''}>
                  {gap > 0 ? `На ${formatPrice(gap)} ниже текущей` : gap < 0 ? `На ${formatPrice(Math.abs(gap))} выше текущей` : 'Совпадает с текущей ценой'}
                </strong>
                <small>Цена может не опуститься до цели. Вы всегда можете изменить порог.</small>
              </div>
            </div>
            <p className="fine">За 1 пассажира, в одну сторону, без багажа</p>
          </fieldset>

          <fieldset>
            <legend><span>03</span> Куда сообщить</legend>
            <TextField
              label="Электронная почта"
              type="email"
              value={email}
              onChange={setEmail}
              valid={isEmail(email)}
              autoComplete="email"
            />
            <p className="fine">Почта из вашего профиля. Пришлём письмо при достижении цели.</p>
            <label className="check">
              <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
              <span>Получать уведомления по этому маршруту до даты вылета. Отключить их можно в личном кабинете.</span>
            </label>
          </fieldset>

          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Создать подписку <IconBell size={16} />
            </button>
            <Link to="/routes" className="btn btn-text">
              Отмена
            </Link>
          </div>
        </form>

        <aside className="subscribe-side">
          <article className="summary-card">
            <p className="pop-caption">Ваш маршрут</p>
            <div className="summary-route">
              <div>
                <strong>{from}</strong>
                <span>{getPlace(from).city}</span>
              </div>
              <span className="summary-line" aria-hidden="true">
                <IconPlane size={16} />
              </span>
              <div>
                <strong>{to}</strong>
                <span>{getPlace(to).city}</span>
              </div>
            </div>
            <dl>
              <div>
                <dt>Вылет</dt>
                <dd>{formatLongDate(date)}</dd>
              </div>
              <div>
                <dt>Целевая цена</dt>
                <dd>{Number.isFinite(targetNumber) ? `≤ ${formatPrice(targetNumber)}` : '—'}</dd>
              </div>
            </dl>
            <p className="fine">В одну сторону · 1 пассажир · без багажа</p>
          </article>
          <article className="next-card">
            <h2>Дальше — мы</h2>
            <ul>
              <li>
                <IconSearch size={16} />
                <span>
                  <strong>Проверяем цены по маршруту</strong>
                  Следим за минимальной доступной стоимостью.
                </span>
              </li>
              <li>
                <IconMail size={16} />
                <span>
                  <strong>Пишем при достижении цели</strong>
                  В письме — актуальная цена и ваш маршрут.
                </span>
              </li>
              <li>
                <IconCheck size={16} />
                <span>
                  <strong>Контроль остаётся у вас</strong>
                  Меняйте цель или выключайте подписку в профиле.
                </span>
              </li>
            </ul>
          </article>
        </aside>
      </div>
    </div>
  )
}
