import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { IconArrowRight, IconBell, IconDots, IconLogout, IconPlus, IconSearch } from '../components/Icons'
import { buildForecast, formatLongDate, formatPrice, formatSignedPrice, getPlace, initialsOf, routeTitle } from '../data'

export default function RoutesPage() {
  const { user, logout, subscriptions, history, toggleSubscription, removeSubscription } = useAuth()
  const [menuId, setMenuId] = useState(null)

  useEffect(() => {
    document.title = 'Мои маршруты · вовремя'
  }, [])

  if (!user) return <Navigate to="/login?next=/routes" replace />

  return (
    <div className="page cabinet">
      <aside className="profile-card">
        <div className="avatar avatar-lg">{initialsOf(user.name)}</div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <nav>
          <a href="#subscriptions" className="is-active">
            <IconBell size={16} /> Мои маршруты
          </a>
          <a href="#history">
            <IconSearch size={16} /> История прогнозов
          </a>
        </nav>
        <p className="profile-note">Письма приходят только по вашим маршрутам. Отключать подписку можно в любой момент.</p>
        <Link to="/" className="quiet-link" onClick={logout}>
          <IconLogout size={16} /> Выйти из аккаунта
        </Link>
      </aside>

      <div className="cabinet-main">
        <div className="page-title-row">
          <div>
            <h1>{user.name.split(' ')[0]}, ваши планы под присмотром.</h1>
            <p className="lede">Все маршруты, уведомления и прогнозы — в одном месте.</p>
          </div>
          <Link to="/routes/new" className="btn btn-primary">
            Новая подписка <IconPlus size={16} />
          </Link>
        </div>

        <section id="subscriptions">
          <div className="section-head tight">
            <h2>
              Активные подписки <span className="count">{subscriptions.length}</span>
            </h2>
            <p className="muted">Проверено сегодня, 12:40 МСК</p>
          </div>
          {subscriptions.length === 0 ? (
            <article className="empty-banner">
              <span className="empty-icon" aria-hidden="true">
                ✉
              </span>
              <div>
                <strong>У вас пока нет подписок. Найдите свой первый маршрут!</strong>
                <p>Выберите направление, а мы сообщим, когда цена станет комфортной.</p>
              </div>
              <Link to="/" className="btn btn-ghost">
                Найти маршрут <IconArrowRight size={16} />
              </Link>
            </article>
          ) : (
            <div className="sub-grid">
              {subscriptions.map((subscription) => {
                const quote = buildForecast(subscription.from, subscription.to, subscription.date)
                return (
                  <article key={subscription.id} className="sub-card">
                    <header>
                      <span className={`status ${subscription.active ? 'is-on' : ''}`}>
                        {subscription.active ? 'Отслеживаем' : 'На паузе'}
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={subscription.active}
                          onChange={() => toggleSubscription(subscription.id)}
                          aria-label={subscription.active ? 'Поставить на паузу' : 'Возобновить'}
                        />
                        <span />
                      </label>
                    </header>
                    <h3>{routeTitle(subscription.from, subscription.to)}</h3>
                    <p className="muted">
                      {subscription.from} → {subscription.to} · {formatLongDate(subscription.date)} · 1 пассажир
                    </p>
                    <div className="sub-prices">
                      <div>
                        <span>Сейчас</span>
                        <strong>{formatPrice(quote.current)}</strong>
                        <em className={quote.deltaDay <= 0 ? 'is-down' : 'is-up'}>{formatSignedPrice(quote.deltaDay)} за сутки</em>
                      </div>
                      <div>
                        <span>Уведомить при цене</span>
                        <strong className="target">≤ {formatPrice(subscription.target)}</strong>
                        <em>На вашу почту</em>
                      </div>
                    </div>
                    <footer>
                      <Link to={`/forecast?from=${subscription.from}&to=${subscription.to}&date=${subscription.date}`}>
                        Смотреть прогноз <IconArrowRight size={14} />
                      </Link>
                      <div className="more">
                        <button
                          type="button"
                          aria-label="Действия с подпиской"
                          onClick={() => setMenuId((current) => (current === subscription.id ? null : subscription.id))}
                        >
                          <IconDots />
                        </button>
                        {menuId === subscription.id ? (
                          <div className="menu-pop">
                            <button type="button" onClick={() => removeSubscription(subscription.id)}>
                              Удалить подписку
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </footer>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section id="history">
          <div className="section-head tight">
            <h2>Недавние прогнозы</h2>
            <p className="muted">Последние {Math.min(history.length, 3)} запроса</p>
          </div>
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Маршрут / вылет</th>
                  <th>Запрос</th>
                  <th>Цена сейчас</th>
                  <th>Рекомендация</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{routeTitle(item.from, item.to)}</strong>
                      <span>
                        {formatLongDate(item.date).replace(' 2026', '')} · {item.from} → {item.to}
                      </span>
                    </td>
                    <td>{item.requestedLabel}</td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <span className={`pill ${item.rec === 'buy' ? 'pill-buy' : 'pill-wait'}`}>
                        {item.rec === 'buy' ? 'Покупать сейчас' : 'Подождать'}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/forecast?from=${item.from}&to=${item.to}&date=${item.date}`}
                        aria-label={`Открыть прогноз ${getPlace(item.to).city}`}
                      >
                        <IconArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
