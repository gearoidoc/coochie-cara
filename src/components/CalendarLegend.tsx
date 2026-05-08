export default function CalendarLegend() {
  return (
    <div className="bg-cream border border-ink/10 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">Legend</p>
      <div className="flex flex-col gap-2.5">

        {/* Flow */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 w-12 shrink-0">
            <div className="w-5 h-5 rounded-full bg-coral/30" />
            <div className="w-5 h-5 rounded-full bg-coral" />
            <div className="w-5 h-5 rounded-full bg-coralDark" />
          </div>
          <span className="text-sm text-ink/70">Flow: light / medium / heavy</span>
        </div>

        {/* Period spotting */}
        <div className="flex items-center gap-3">
          <div className="w-12 shrink-0 flex justify-center">
            <div className="relative w-5 h-5">
              <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-coral" />
            </div>
          </div>
          <span className="text-sm text-ink/70">Period spotting</span>
        </div>

        {/* Mid-cycle spotting */}
        <div className="flex items-center gap-3">
          <div className="w-12 shrink-0 flex justify-center">
            <div className="relative w-5 h-5">
              <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full border border-coral" />
            </div>
          </div>
          <span className="text-sm text-ink/70">Mid-cycle spotting</span>
        </div>

        {/* Symptom */}
        <div className="flex items-center gap-3">
          <div className="w-12 shrink-0 flex justify-center">
            <div className="w-2 h-2 rounded-full bg-sage" />
          </div>
          <span className="text-sm text-ink/70">Symptom logged</span>
        </div>

        {/* Note */}
        <div className="flex items-center gap-3">
          <div className="w-12 shrink-0 flex justify-center">
            <div className="w-2 h-2 rounded-full bg-butter" />
          </div>
          <span className="text-sm text-ink/70">Note logged</span>
        </div>

        {/* Today */}
        <div className="flex items-center gap-3">
          <div className="w-12 shrink-0 flex justify-center">
            <div className="w-5 h-5 rounded-full ring-2 ring-ink flex items-center justify-center">
              <span className="text-xs font-medium text-ink">8</span>
            </div>
          </div>
          <span className="text-sm text-ink/70">Today</span>
        </div>

        {/* Predicted period */}
        <div className="flex items-center gap-3">
          <div className="w-12 shrink-0 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-coral" />
          </div>
          <span className="text-sm text-ink/70">Predicted period</span>
        </div>

      </div>
    </div>
  )
}
