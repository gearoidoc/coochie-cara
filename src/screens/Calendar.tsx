import { useMemo, useState } from 'react'
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
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { DayEntry } from '../types'
import DayCell from '../components/DayCell'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))

  const gridStart = startOfWeek(currentMonth, { weekStartsOn: 1 })
  const gridDays = eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) })

  const startKey = format(gridDays[0], 'yyyy-MM-dd')
  const endKey = format(gridDays[41], 'yyyy-MM-dd')

  const dayEntries = useLiveQuery(
    () => db.days.where('date').between(startKey, endKey, true, true).toArray(),
    [startKey, endKey],
    []
  )

  const dayMap = useMemo(() => {
    const map = new Map<string, DayEntry>()
    for (const entry of dayEntries ?? []) {
      map.set(entry.date, entry)
    }
    return map
  }, [dayEntries])

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
        {gridDays.map(day => (
          <DayCell
            key={day.toISOString()}
            date={day}
            dayRecord={dayMap.get(format(day, 'yyyy-MM-dd'))}
            isCurrentMonth={isSameMonth(day, currentMonth)}
          />
        ))}
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
