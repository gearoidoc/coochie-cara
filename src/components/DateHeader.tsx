import { format, parseISO } from 'date-fns';

interface Props {
  viewedDate: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function DateHeader({ viewedDate, onPrev, onNext, onToday }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isToday = viewedDate === todayStr;
  const date = parseISO(viewedDate);
  const dateDisplay = format(date, 'EEE d MMM');

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-coral/10 text-coralDark text-xl active:scale-95 transition-all flex-shrink-0"
        >
          ←
        </button>

        <button onClick={isToday ? undefined : onToday} className="flex-1 text-center">
          <span className="text-3xl font-extrabold">
            {isToday ? (
              <>
                <span className="text-coral">Today</span>
                <span className="text-ink">, {dateDisplay}</span>
              </>
            ) : (
              <span className="text-ink">{dateDisplay}</span>
            )}
          </span>
        </button>

        <button
          onClick={isToday ? undefined : onNext}
          className={`w-10 h-10 rounded-full flex items-center justify-center bg-coral/10 text-coralDark text-xl active:scale-95 transition-all flex-shrink-0 ${
            isToday ? 'opacity-30 pointer-events-none' : ''
          }`}
        >
          →
        </button>
      </div>

      <p className="text-ink/60 text-sm mt-1">
        {isToday ? 'How are you today?' : format(date, 'd MMMM yyyy')}
      </p>

      {!isToday && (
        <button
          onClick={onToday}
          className="mt-2 bg-coral text-white rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          Back to today →
        </button>
      )}
    </div>
  );
}
