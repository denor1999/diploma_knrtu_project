import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight, IconBell, IconPlane, IconSearch } from '../components/Icons'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Страница не найдена · вовремя'
  }, [])

  return (
    <div className="page not-found">
      <div className="not-found-copy">
        <p className="eyebrow">404 · Страница не найдена</p>
        <h1>
          Кажется, мы
          <br />
          сбились с маршрута.
        </h1>
        <p className="lede">
          Такой страницы нет или её адрес изменился. Но хорошее путешествие всё ещё впереди — давайте найдём новый маршрут.
        </p>
        <Link to="/" className="btn btn-primary">
          На главную <IconArrowRight size={16} />
        </Link>
      </div>
      <div className="not-found-art" aria-hidden="true">
        <span className="orbit" />
        <span className="dash-orbit" />
        <strong>404</strong>
        <span className="course-chip">Нужен новый курс</span>
        <span className="plane-badge">
          <IconPlane size={22} />
        </span>
        <i className="dot" />
      </div>
      <section className="continue">
        <div>
          <h2>Продолжим отсюда?</h2>
          <p>Иногда лучший маршрут — другой маршрут.</p>
        </div>
        <Link to="/" className="continue-card">
          <IconSearch />
          <span>
            <strong>Найти билеты</strong>
            Узнать, когда лучше покупать
          </span>
          <IconArrowRight />
        </Link>
        <Link to="/routes" className="continue-card">
          <IconBell />
          <span>
            <strong>Мои маршруты</strong>
            Вернуться к своим подпискам
          </span>
          <IconArrowRight />
        </Link>
      </section>
    </div>
  )
}

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Конфиденциальность · вовремя'
  }, [])

  return (
    <div className="page legal">
      <p className="eyebrow">Документы</p>
      <h1>Конфиденциальность</h1>
      <p className="lede">
        «Вовремя» хранит почту, маршруты и целевые цены, чтобы присылать уведомления, на которые вы согласились. Билеты сервис не продаёт и к тарифам авиакомпаний не подключается как касса.
      </p>
      <p>
        Прогноз — оценка модели, а не гарантия цены. Письма можно отключить в кабинете в любой момент. По вопросам пишите на support@vovremya.travel.
      </p>
      <Link to="/" className="text-link">
        На главную
      </Link>
    </div>
  )
}
