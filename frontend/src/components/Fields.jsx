import { useMemo, useState } from 'react'
import { formatLongDate, formatMonthYear, formatWeekday, parseISODate, toISODate } from '../data'
import { IconCalendar, IconChevron } from './Icons'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  valid = false,
  error = '',
  autoComplete,
  suffix,
  inputMode,
}) {
  return (
    <label className={`field ${error ? 'is-error' : ''}`}>
      {label ? <span className="field-label">{label}</span> : null}
      <span className="field-box">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix}
        {valid ? <span className="field-ok" aria-hidden="true" /> : null}
      </span>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}

export function SelectField({ label, valueLabel, open, onToggle, children }) {
  return (
    <div className={`field ${open ? 'is-open' : ''}`}>
      {label ? <span className="field-label">{label}</span> : null}
      <button type="button" className="field-box field-button" aria-expanded={open} onClick={onToggle}>
        <span>{valueLabel}</span>
        <IconChevron size={16} />
      </button>
      {open ? children : null}
    </div>
  )
}

export function CalendarField({ label, value, open, onToggle, onChange }) {
  const selected = parseISODate(value)
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const [trackedValue, setTrackedValue] = useState(value)
  if (trackedValue !== value) {
    setTrackedValue(value)
    setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1))
  }

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const items = Array.from({ length: firstWeekday }, () => null)
    for (let day = 1; day <= daysInMonth; day += 1) items.push(new Date(year, month, day))
    return items
  }, [cursor])

  function shift(delta) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  return (
    <div className={`field ${open ? 'is-open' : ''}`}>
      <span className="field-label">{label}</span>
      <button type="button" className="field-box field-button" aria-expanded={open} onClick={onToggle}>
        <span>{formatLongDate(value)}</span>
        <IconCalendar size={18} />
      </button>
      {open ? (
        <div className="popover calendar-pop" role="dialog" aria-label="Дата вылета">
          <div className="calendar-head">
            <button type="button" aria-label="Предыдущий месяц" onClick={() => shift(-1)}>
              ‹
            </button>
            <strong>{formatMonthYear(cursor)}</strong>
            <button type="button" aria-label="Следующий месяц" onClick={() => shift(1)}>
              ›
            </button>
          </div>
          <div className="calendar-grid calendar-weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {cells.map((date, index) =>
              date ? (
                <button
                  key={toISODate(date)}
                  type="button"
                  className={toISODate(date) === value ? 'is-selected' : ''}
                  onClick={() => onChange(toISODate(date))}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              ),
            )}
          </div>
          <p className="calendar-foot">
            {selected.getDate()} {formatLongDate(value).split(' ').slice(1, 2)} · {formatWeekday(value)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
