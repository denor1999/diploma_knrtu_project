export const REFERENCE_DATE = '2026-11-02'

export const places = [
  { code: 'SVO', city: 'Москва', airport: 'Шереметьево', group: 'moscow' },
  { code: 'DME', city: 'Москва', airport: 'Домодедово', group: 'moscow' },
  { code: 'VKO', city: 'Москва', airport: 'Внуково', group: 'moscow' },
  { code: 'AER', city: 'Сочи', airport: 'Адлер', group: 'city' },
  { code: 'KZN', city: 'Казань', airport: 'Казань', group: 'city' },
  { code: 'KGD', city: 'Калининград', airport: 'Храброво', group: 'city' },
  { code: 'LED', city: 'Санкт-Петербург', airport: 'Пулково', group: 'city' },
]

export const placePhotos = {
  AER: '/photos/coast.jpg',
  KZN: '/photos/kazan.jpg',
  KGD: '/photos/oldtown.jpg',
  LED: '/photos/shore.jpg',
  SVO: '/photos/shore.jpg',
  DME: '/photos/shore.jpg',
  VKO: '/photos/shore.jpg',
}

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

const MONTHS_NAME = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

export function getPlace(code) {
  return places.find((place) => place.code === code) ?? places[0]
}

export function parseISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toISODate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(iso, days) {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function formatLongDate(iso) {
  const date = parseISODate(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDayMonth(iso) {
  const date = parseISODate(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatShortDate(iso) {
  const date = parseISODate(iso)
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}

export function formatMonthYear(date) {
  return `${MONTHS_NAME[date.getMonth()]} ${date.getFullYear()}`
}

export function formatWeekday(iso) {
  return WEEKDAYS[parseISODate(iso).getDay()]
}

export function daysBetween(fromIso, toIso) {
  const from = parseISODate(fromIso)
  const to = parseISODate(toIso)
  return Math.round((to - from) / 86400000)
}

export function formatPrice(value) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

export function formatSignedPrice(value) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${new Intl.NumberFormat('ru-RU').format(Math.abs(value))} ₽`
}

export function originLabel(code) {
  const place = getPlace(code)
  if (place.group === 'moscow') return `Москва, ${place.airport}`
  return `${place.city}, ${place.airport}`
}

export function destinationLabel(code) {
  const place = getPlace(code)
  return `${place.city} · ${place.code}`
}

export function routeTitle(from, to) {
  return `${getPlace(from).city} → ${getPlace(to).city}`
}

const PROFILES = {
  AER: {
    current: 8400,
    base: 9000,
    low: 8900,
    high: 10600,
    deltaDay: -280,
    factors: [
      { title: 'Сезон поездки', note: 'Спрос на южное направление', value: 900 },
      { title: 'Дни до вылета', note: '', value: 650 },
      { title: 'Конкуренция авиакомпаний', note: 'Несколько прямых рейсов', value: -550 },
      { title: 'Текущий спрос', note: 'Ниже среднего по маршруту', value: -300 },
    ],
  },
  KZN: {
    current: 5200,
    base: 5400,
    low: 4500,
    high: 5600,
    deltaDay: -100,
    factors: [
      { title: 'Сезон поездки', note: 'Спокойный осенний спрос', value: -200 },
      { title: 'Дни до вылета', note: '', value: 150 },
      { title: 'Конкуренция авиакомпаний', note: 'Прямые рейсы у нескольких перевозчиков', value: -350 },
      { title: 'Текущий спрос', note: 'Ниже обычного уровня', value: -200 },
    ],
  },
  KGD: {
    current: 6900,
    base: 7200,
    low: 6100,
    high: 7400,
    deltaDay: 120,
    factors: [
      { title: 'Сезон поездки', note: 'Интерес к городу вырос умеренно', value: 250 },
      { title: 'Дни до вылета', note: '', value: 180 },
      { title: 'Конкуренция авиакомпаний', note: 'Стыковки сдерживают тариф', value: -700 },
      { title: 'Текущий спрос', note: 'Близок к среднему по маршруту', value: -180 },
    ],
  },
  LED: {
    current: 4300,
    base: 4600,
    low: 3900,
    high: 5100,
    deltaDay: -40,
    factors: [
      { title: 'Сезон поездки', note: 'Направление летает часто', value: -150 },
      { title: 'Дни до вылета', note: '', value: 220 },
      { title: 'Конкуренция авиакомпаний', note: 'Много рейсов в течение дня', value: -280 },
      { title: 'Текущий спрос', note: 'Обычный уровень для ноября', value: -90 },
    ],
  },
}

function hashCode(value) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function seriesFor(current, seed) {
  const points = []
  let price = Math.round(current * 1.22)
  for (let index = 30; index >= 1; index -= 1) {
    const wave = Math.sin((index + seed) / 2.4) * current * 0.035
    const drift = ((30 - index) / 30) * (current - price)
    price = Math.round(price + drift * 0.18 + wave * 0.15)
    points.push({ date: addDays(REFERENCE_DATE, -index), price: Math.max(1000, price) })
  }
  points.push({ date: REFERENCE_DATE, price: current })
  return points
}

function forecastSeries(current, expected) {
  const points = []
  for (let day = 0; day <= 7; day += 1) {
    const t = day / 7
    const eased = t * t * (3 - 2 * t)
    points.push({
      date: addDays(REFERENCE_DATE, day),
      price: Math.round(current + (expected - current) * eased),
    })
  }
  return points
}

export function buildForecast(from, to, date) {
  const profile = PROFILES[to] ?? PROFILES.AER
  const daysLeft = Math.max(daysBetween(REFERENCE_DATE, date), 0)
  const factors = profile.factors.map((factor) =>
    factor.title === 'Дни до вылета'
      ? { ...factor, note: daysLeft === 0 ? 'Вылет сегодня' : `До поездки осталось ${daysLeft} ${pluralDays(daysLeft)}` }
      : factor,
  )
  const expected = profile.base + factors.reduce((sum, factor) => sum + factor.value, 0)
  const rec = expected > profile.current + 200 ? 'buy' : 'wait'
  return {
    from,
    to,
    date,
    current: profile.current,
    expected,
    low: profile.low,
    high: profile.high,
    base: profile.base,
    deltaDay: profile.deltaDay,
    factors,
    rec,
    history: seriesFor(profile.current, hashCode(to)),
    forecast: forecastSeries(profile.current, expected),
    updatedAt: '2 ноября 2026 в 12:40 МСК',
    horizonDate: addDays(REFERENCE_DATE, 7),
  }
}

function pluralDays(count) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня'
  return 'дней'
}

export const popularRoutes = [
  {
    to: 'AER',
    from: 'SVO',
    date: '2026-11-24',
    price: 8400,
    tag: 'К морю',
    image: '/photos/coast.jpg',
  },
  {
    to: 'KZN',
    from: 'SVO',
    date: '2026-11-24',
    price: 5200,
    tag: 'На выходные',
    image: '/photos/kazan.jpg',
  },
  {
    to: 'KGD',
    from: 'SVO',
    date: '2026-11-24',
    price: 6900,
    tag: 'За впечатлениями',
    image: '/photos/oldtown.jpg',
  },
]

export const DEMO_USER = {
  name: 'Иван Ожгихин',
  email: 'ozhgixinv@list.ru',
  password: 'Ivan1234',
}

export function initialsOf(name) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'В'
}

export function passwordIssues(password) {
  return {
    length: password.length >= 8,
    digit: /\d/.test(password),
    upper: /[A-ZА-ЯЁ]/.test(password),
  }
}

export function firstPasswordError(password) {
  const issues = passwordIssues(password)
  if (!issues.length) return 'Добавьте хотя бы 8 символов.'
  if (!issues.digit) return 'Добавьте хотя бы одну цифру.'
  if (!issues.upper) return 'Добавьте хотя бы одну заглавную букву.'
  return ''
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export const seedSubscriptions = [
  {
    id: 'sub-sochi',
    from: 'SVO',
    to: 'AER',
    date: '2026-11-24',
    target: 7900,
    active: true,
    email: DEMO_USER.email,
  },
  {
    id: 'sub-kazan',
    from: 'SVO',
    to: 'KZN',
    date: '2026-11-24',
    target: 4800,
    active: true,
    email: DEMO_USER.email,
  },
]

export const seedHistory = [
  {
    id: 'h1',
    from: 'SVO',
    to: 'AER',
    date: '2026-11-24',
    requestedLabel: 'Сегодня, 12:40',
    price: 8400,
    rec: 'buy',
  },
  {
    id: 'h2',
    from: 'SVO',
    to: 'KGD',
    date: '2026-11-24',
    requestedLabel: 'Сегодня, 10:15',
    price: 6900,
    rec: 'wait',
  },
  {
    id: 'h3',
    from: 'SVO',
    to: 'AER',
    date: '2026-11-24',
    requestedLabel: '1 ноя, 18:32',
    price: 8600,
    rec: 'buy',
  },
]
