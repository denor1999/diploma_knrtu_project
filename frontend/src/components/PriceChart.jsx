import { formatPrice, formatShortDate } from '../data'

const WIDTH = 680
const HEIGHT = 248
const PAD = { l: 52, r: 12, t: 18, b: 36 }

function chartScale(values) {
  const lowest = Math.min(...values)
  const highest = Math.max(...values)
  const min = Math.max(0, Math.floor((lowest * 0.82) / 1000) * 1000)
  const max = Math.ceil((highest * 1.08) / 1000) * 1000
  const span = Math.max(max - min, 1000)
  const y = (value) => PAD.t + (1 - (value - min) / span) * (HEIGHT - PAD.t - PAD.b)
  const ticks = []
  const step = span <= 4000 ? 1000 : 2000
  for (let tick = min; tick <= max; tick += step) ticks.push(tick)
  return { y, ticks: ticks.reverse() }
}

export default function PriceChart({ forecast }) {
  const history = forecast.history
  const future = forecast.forecast
  const { y, ticks } = chartScale([
    ...history.map((point) => point.price),
    ...future.map((point) => point.price),
    forecast.low,
    forecast.high,
  ])
  const count = history.length + future.length - 1
  const x = (index) => PAD.l + (index / (count - 1)) * (WIDTH - PAD.l - PAD.r)

  const historyLine = history
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(1)} ${y(point.price).toFixed(1)}`)
    .join(' ')

  const futureStart = history.length - 1
  const futureLine = future
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(futureStart + index).toFixed(1)} ${y(point.price).toFixed(1)}`)
    .join(' ')

  const band = future
    .map((point, index) => {
      const t = index / (future.length - 1)
      return {
        x: x(futureStart + index),
        low: forecast.current + (forecast.low - forecast.current) * t,
        high: forecast.current + (forecast.high - forecast.current) * t,
      }
    })
  const bandPath = [
    ...band.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${y(point.high).toFixed(1)}`),
    ...[...band].reverse().map((point) => `L ${point.x.toFixed(1)} ${y(point.low).toFixed(1)}`),
    'Z',
  ].join(' ')

  const labelIndexes = [0, 7, 14, 21, history.length - 1]
  const nowX = x(history.length - 1)
  const nowY = y(forecast.current)
  const endX = x(count - 1)
  const endY = y(forecast.expected)

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="График изменения цены">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.l} x2={WIDTH - PAD.r} y1={y(tick)} y2={y(tick)} className="chart-grid" />
            <text x={PAD.l - 8} y={y(tick) + 4} className="chart-axis" textAnchor="end">
              {new Intl.NumberFormat('ru-RU').format(tick)}
            </text>
          </g>
        ))}
        <path d={bandPath} className="chart-band" />
        <path d={historyLine} className="chart-history" />
        <path d={futureLine} className="chart-future" />
        <circle cx={nowX} cy={nowY} r="5" className="chart-dot" />
        <circle cx={endX} cy={endY} r="4" className="chart-dot-future" />
        <g transform={`translate(${Math.min(nowX - 54, WIDTH - 150)}, ${nowY - 34})`}>
          <rect width="118" height="26" rx="8" className="chart-pill" />
          <text x="59" y="17" textAnchor="middle" className="chart-pill-text">
            {formatPrice(forecast.current)} сейчас
          </text>
        </g>
        <text x={endX - 8} y={endY - 12} textAnchor="end" className="chart-end-label">
          {formatPrice(forecast.expected)}
        </text>
        {labelIndexes.map((index) => (
          <text key={history[index].date} x={x(index)} y={HEIGHT - 8} textAnchor="middle" className="chart-axis">
            {formatShortDate(history[index].date)}
          </text>
        ))}
        <text x={endX} y={HEIGHT - 8} textAnchor="middle" className="chart-axis">
          {formatShortDate(future[future.length - 1].date)}
        </text>
        <text x={nowX} y={HEIGHT - 22} textAnchor="middle" className="chart-today">
          сегодня
        </text>
      </svg>
    </div>
  )
}
