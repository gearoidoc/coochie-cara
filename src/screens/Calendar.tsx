import { useMemo, useState } from 'react'
import MonthPicker from '../components/MonthPicker'
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
import DayCell, { type PredictionInfo } from '../components/DayCell'
import CalendarLegend from '../components/CalendarLegend'
import { predictNextPeriod } from '../lib/predictions'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [fadeIn, setFadeIn] = useState(true)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const gridStart = startOfWeek(currentMonth, { weekStartsOn: 1 })
  const gridDays = eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) })

  const startKey = format(gridDays[0], 'yyyy-MM-dd')
  const endKey = format(gridDays[41], 'yyyy-MM-dd')

  const dayEntries = useLiveQuery(
    () => db.days.where('date').between(startKey, endKey, true, true).toArray(),
    [startKey, endKey],
    []
  )

  const allRecords = useLiveQuery(() => db.days.toArray())

  const dayMap = useMemo(() => {
    const map = new Map<string, DayEntry>()
    for (const entry of dayEntries ?? []) {
      map.set(entry.date, entry)
    }
    return map
  }, [dayEntries])

  const predictionMap = useMemo(() => {
    if (allRecords === undefined) return null
    const prediction = predictNextPeriod(allRecords)
    if (prediction.nextPeriodStart === null || prediction.predictedPeriodLength === null) return null
    const map = new Map<string, PredictionInfo>()
    for (let i = 0; i < prediction.predictedPeriodLength; i++) {
      const key = format(addDays(new Date(prediction.nextPeriodStart), i), 'yyyy-MM-dd')
      map.set(key, { isPredictedPeriod: true })
    }
    return map
  }, [allRecords])

  function navigateMonth(newMonth: Date) {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentMonth(newMonth)
      setFadeIn(true)
    }, 150)
  }

  const onCurrentMonth = isSameMonth(currentMonth, new Date())

  return (
    <>
    <div className="flex flex-col min-h-screen bg-cream p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(subMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 text-ink text-lg active:scale-95 transition-all"
        >
          ←
        </button>
        <button
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-1 text-xl font-bold text-ink active:scale-95 transition-all"
        >
          {format(currentMonth, 'MMMM yyyy')}
          <span className="text-base leading-none">▾</span>
        </button>
        <div className="flex items-center gap-1">
          {!onCurrentMonth && (
            <button
              onClick={() => navigateMonth(startOfMonth(new Date()))}
              className="text-xs font-semibold text-coral px-2 py-1 rounded-lg active:scale-95 transition-all"
            >
              Today
            </button>
          )}
          <button
            onClick={() => navigateMonth(addMonths(currentMonth, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 text-ink text-lg active:scale-95 transition-all"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-ink/50 py-1">
            {day}
          </div>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 gap-y-1 transition-opacity duration-150 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
      >
        {gridDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          return (
            <DayCell
              key={day.toISOString()}
              date={day}
              dayRecord={dayMap.get(dateKey)}
              isCurrentMonth={isSameMonth(day, currentMonth)}
              prediction={predictionMap?.get(dateKey)}
            />
          )
        })}
      </div>
      <div className="mt-6">
        <CalendarLegend />
      </div>
    </div>

    <MonthPicker
      isOpen={isPickerOpen}
      currentMonth={currentMonth}
      onSelect={(date) => navigateMonth(date)}
      onClose={() => setIsPickerOpen(false)}
    />
    </>
  )
}
