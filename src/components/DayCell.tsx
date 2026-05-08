import { format, isToday } from 'date-fns'
import type { DayEntry } from '../types'

export interface PredictionInfo {
  isPredictedPeriod: boolean
}

interface DayCellProps {
  date: Date
  dayRecord: DayEntry | undefined
  isCurrentMonth: boolean
  prediction?: PredictionInfo
  onClick?: () => void
}

function flowCircleClasses(dayRecord: DayEntry | undefined): { bg: string; text: string } {
  if (!dayRecord?.onPeriod) return { bg: '', text: 'text-ink' }

  const flow = dayRecord.flow
  if (flow === 'light') return { bg: 'bg-coral/30', text: 'text-ink' }
  if (flow === 'medium') return { bg: 'bg-coral', text: 'text-ink' }
  if (flow === 'heavy') return { bg: 'bg-coralDark', text: 'text-white' }
  if (flow === 'spotting' || flow === 'none') return { bg: '', text: 'text-ink' }
  // onPeriod true but flow undefined — graceful fallback
  return { bg: 'bg-coral/15', text: 'text-ink' }
}

export default function DayCell({ date, dayRecord, isCurrentMonth, prediction, onClick }: DayCellProps) {
  const dayNum = format(date, 'd')

  if (!isCurrentMonth) {
    return (
      <div
        className="relative aspect-square flex items-center justify-center active:scale-95 transition-transform"
        onClick={onClick}
      >
        <span className="text-sm font-medium text-ink/30">{dayNum}</span>
      </div>
    )
  }

  const { bg, text } = flowCircleClasses(dayRecord)
  const today = isToday(date)
  const onPeriod = dayRecord?.onPeriod ?? false
  const flow = dayRecord?.flow
  const hasSymptoms = (dayRecord?.symptoms?.length ?? 0) > 0
  const hasNote = (dayRecord?.note?.trim().length ?? 0) > 0

  const showSpottingFilled = onPeriod && flow === 'spotting'
  const showSpottingOutline = !onPeriod && flow === 'spotting'

  const dateKey = format(date, 'yyyy-MM-dd')
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const hasRealPeriodData = onPeriod || (flow !== undefined && flow !== null)
  const showPredictedOutline =
    prediction?.isPredictedPeriod === true &&
    !hasRealPeriodData &&
    dateKey >= todayKey

  return (
    <div
      className="relative aspect-square flex items-center justify-center active:scale-95 transition-transform"
      onClick={onClick}
    >
      {showPredictedOutline && (
        <div className="absolute w-8 h-8 rounded-full border-2 border-dashed border-coral z-0" />
      )}
      <div
        className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full ${bg} ${today ? 'ring-2 ring-ink' : ''}`}
      >
        <span className={`text-sm font-medium ${text}`}>{dayNum}</span>
      </div>

      {showSpottingFilled && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-coral z-20" />
      )}
      {showSpottingOutline && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-coral z-20" />
      )}

      {(hasSymptoms || hasNote) && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 z-20">
          {hasSymptoms && <div className="w-1 h-1 rounded-full bg-sage" />}
          {hasNote && <div className="w-1 h-1 rounded-full bg-butter" />}
        </div>
      )}
    </div>
  )
}
