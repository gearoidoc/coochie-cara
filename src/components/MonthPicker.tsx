import { useEffect, useState } from 'react'
import { getYear, getMonth } from 'date-fns'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MIN_YEAR = 2020
const MAX_YEAR = new Date().getFullYear() + 2

interface MonthPickerProps {
  isOpen: boolean
  currentMonth: Date
  onSelect: (date: Date) => void
  onClose: () => void
}

export default function MonthPicker({ isOpen, currentMonth, onSelect, onClose }: MonthPickerProps) {
  const [displayYear, setDisplayYear] = useState(getYear(currentMonth))

  useEffect(() => {
    if (isOpen) setDisplayYear(getYear(currentMonth))
  }, [isOpen, currentMonth])

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const todayYear = new Date().getFullYear()
  const todayMonthIndex = new Date().getMonth()
  const currentMonthYear = getYear(currentMonth)
  const currentMonthIndex = getMonth(currentMonth)

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-cream rounded-t-2xl p-6 transition-transform duration-200 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setDisplayYear(y => y - 1)}
            disabled={displayYear <= MIN_YEAR}
            className={`w-10 h-11 flex items-center justify-center rounded-full bg-ink/5 text-ink text-lg active:scale-95 transition-all ${
              displayYear <= MIN_YEAR ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            ←
          </button>
          <span className="text-xl font-bold text-ink">{displayYear}</span>
          <button
            onClick={() => setDisplayYear(y => y + 1)}
            disabled={displayYear >= MAX_YEAR}
            className={`w-10 h-11 flex items-center justify-center rounded-full bg-ink/5 text-ink text-lg active:scale-95 transition-all ${
              displayYear >= MAX_YEAR ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((name, index) => {
            const isSelected = displayYear === currentMonthYear && index === currentMonthIndex
            const isTodayMonth = displayYear === todayYear && index === todayMonthIndex

            return (
              <button
                key={name}
                onClick={() => { onSelect(new Date(displayYear, index, 1)); onClose() }}
                className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                  isSelected ? 'bg-coral text-ink' : 'bg-ink/5 text-ink'
                } ${isTodayMonth ? 'ring-2 ring-ink' : ''}`}
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
