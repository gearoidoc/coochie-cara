import { useState } from 'react'
import {
  format,
  startOfMonth,
  startOfWeek,
  eachDayOfInterval,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
} from 'date-fns'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))

  const gridStart = startOfWeek(currentMonth, { weekStartsOn: 1 })
  const gridDays = eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) })

  return (
    <div className="flex flex-col min-h-screen bg-cream p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 text-ink text-lg active:scale-95 transition-all"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-ink">
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 text-ink text-lg active:scale-95 transition-all"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-ink/50 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {gridDays.map(day => {
          const inMonth = isSameMonth(day, currentMonth)
          return (
            <div
              key={day.toISOString()}
              className="aspect-square flex items-center justify-center"
            >
              <span className={`text-sm font-medium ${inMonth ? 'text-ink' : 'text-ink/30'}`}>
                {format(day, 'd')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
