import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { TextField } from '../components/Fields'
import { IconEye, IconPin, IconShield } from '../components/Icons'
import { firstPasswordError, isEmail, passwordIssues } from '../data'

function Visual() {
  return (
    <aside className="auth-visual">
      <img src="/photos/shore.jpg" alt="" />
      <div className="auth-visual-shade" />
      <span className="place-chip">
        <IconPin /> Сочи, Чёрное море
      </span>
      <div className="auth-visual-copy">
        <h2>
          Хорошая поездка
          <br />
          начинается вовремя.
        </h2>
        <p>Наблюдаем за ценами. Объясняем прогноз. Помогаем выбрать момент для покупки.</p>
        <span>
          <IconShield /> Без обещаний. С опорой на данные.
        </span>
      </div>
    </aside>
  )
}

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/routes'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = 'Вход · вовремя'
  }, [])

  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [user, next, navigate])

  async function submit(event) {
    event.preventDefault()
    if (!isEmail(email)) {
      setError('Введите корректную почту.')
      return
    }
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.')
      return
    }
    setPending(true)
    const message = await login(email, password, remember)
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    navigate(next)
  }

  return (
    <div className="page auth-page">
      <Visual />
      <section className="auth-form">
        <p className="eyebrow">С возвращением</p>
        <h1>
          Ваши маршруты
          <br />
          ждут вас.
        </h1>
        <p className="lede">Войдите, чтобы следить за ценами и не пропустить нужный момент.</p>
        <form onSubmit={submit}>
          <TextField label="Электронная почта" type="email" value={email} onChange={setEmail} valid={isEmail(email)} autoComplete="email" />
          <TextField
            label="Пароль"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            suffix={
              <button type="button" className="icon-btn" aria-label={show ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShow((value) => !value)}>
                <IconEye off={show} />
              </button>
            }
          />
          <div className="auth-row">
            <label className="check">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>Запомнить меня</span>
            </label>
            <button
              type="button"
              className="text-link"
              onClick={() => setHint('В этой версии письмо не отправляется. Если забыли пароль, создайте новый аккаунт.')}
            >
              Забыли пароль?
            </button>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          {hint ? <p className="form-hint">{hint}</p> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
            {pending ? 'Входим…' : 'Войти →'}
          </button>
        </form>
        <p className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
        <p className="secure-note">
          <IconShield /> Ваши данные защищены. Никаких писем без подписки.
        </p>
      </section>
    </div>
  )
}

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [agree, setAgree] = useState(true)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const issues = passwordIssues(password)
  const passwordError = password ? firstPasswordError(password) : ''

  useEffect(() => {
    document.title = 'Регистрация · вовремя'
  }, [])

  useEffect(() => {
    if (user) navigate('/routes', { replace: true })
  }, [user, navigate])

  async function submit(event) {
    event.preventDefault()
    if (name.trim().length < 2) {
      setError('Как к вам обращаться?')
      return
    }
    if (!isEmail(email)) {
      setError('Введите корректную почту.')
      return
    }
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (!agree) {
      setError('Примите условия использования, чтобы создать аккаунт.')
      return
    }
    setPending(true)
    const message = await register({ name, email, password })
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    navigate('/routes')
  }

  return (
    <div className="page auth-page">
      <Visual />
      <section className="auth-form">
        <p className="eyebrow">Начнём с хорошего решения</p>
        <h1>
          Больше планов.
          <br />
          Меньше переплат.
        </h1>
        <p className="lede">Сохраняйте маршруты и получайте уведомления о нужной цене. Это бесплатно.</p>
        <form onSubmit={submit}>
          <TextField label="Как вас зовут" value={name} onChange={setName} valid={name.trim().length >= 2} autoComplete="name" />
          <TextField label="Электронная почта" type="email" value={email} onChange={setEmail} valid={isEmail(email)} autoComplete="email" />
          <TextField
            label="Придумайте пароль"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            error={passwordError}
            autoComplete="new-password"
            suffix={
              <button type="button" className="icon-btn" aria-label={show ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShow((value) => !value)}>
                <IconEye off={show} />
              </button>
            }
          />
          <ul className="rules">
            <li className={issues.length ? 'is-ok' : ''}>8+ символов</li>
            <li className={issues.digit ? 'is-ok' : ''}>Есть цифра</li>
            <li className={issues.upper ? 'is-ok' : ''}>Aa</li>
          </ul>
          <label className="check">
            <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
            <span>
              Я принимаю <Link to="/privacy">условия использования</Link> и <Link to="/privacy">политику конфиденциальности</Link>.
            </span>
          </label>
          {error && error !== passwordError ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
            {pending ? 'Создаём…' : 'Создать аккаунт →'}
          </button>
        </form>
        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </section>
    </div>
  )
}
