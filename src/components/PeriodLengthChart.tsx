import type { Cycle } from '../lib/predictions';

// `cycles` must be the already-filtered usable cycles from `stats.usableCycles`.
interface Props {
  cycles: Cycle[];
  medianPeriodLength: number | null;
}

const VIEW_W = 400;
const VIEW_H = 240;
const ML = 32; // left margin
const MR = 8;  // right margin
const MT = 16; // top margin
const MB = 32; // bottom margin
const PLOT_X1 = ML;
const PLOT_X2 = VIEW_W - MR;   // 392
const PLOT_Y1 = MT;             // 16
const PLOT_Y2 = VIEW_H - MB;   // 208
const PLOT_W = PLOT_X2 - PLOT_X1; // 360
const PLOT_H = PLOT_Y2 - PLOT_Y1; // 192

export default function PeriodLengthChart({ cycles, medianPeriodLength }: Props) {
  const valid = [...cycles]
    .filter(c => Number.isFinite(c.periodLengthDays))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (valid.length === 0) return null;

  const lengths = valid.map(c => c.periodLengthDays);
  const minLen = Math.min(...lengths);
  const maxLen = Math.max(...lengths);

  const minY = Math.max(0, Math.floor(minLen - 1));
  const maxY = Math.max(8, Math.ceil(maxLen + 1));
  const yRange = maxY - minY;

  function toSvgY(value: number): number {
    return PLOT_Y2 - ((value - minY) / yRange) * PLOT_H;
  }

  // Gridlines at multiples of 2 within [minY, maxY]
  const gridStart = Math.ceil(minY / 2) * 2;
  const gridLines: number[] = [];
  for (let v = gridStart; v <= maxY; v += 2) {
    gridLines.push(v);
  }

  const slotW = PLOT_W / valid.length;
  const barW = slotW * 0.7;

  return (
    <div className="bg-cream border border-ink/10 rounded-2xl p-5">
      <h3 className="text-xs uppercase tracking-wide text-ink/50 mb-3">Period length</h3>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto">

        {/* Gridlines + Y-axis labels */}
        {gridLines.map(v => {
          const y = toSvgY(v);
          return (
            <g key={v}>
              <line
                x1={PLOT_X1} y1={y} x2={PLOT_X2} y2={y}
                stroke="#2D2A32" strokeOpacity="0.08" strokeWidth="1"
              />
              <text
                x={PLOT_X1 - 4} y={y}
                fontSize="10" fill="#2D2A32" fillOpacity="0.5"
                textAnchor="end" dominantBaseline="middle"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {valid.map((cycle, i) => {
          const barTop = toSvgY(cycle.periodLengthDays);
          const barH = PLOT_Y2 - barTop;
          const barX = PLOT_X1 + slotW * (i + 0.15);
          return (
            <rect
              key={cycle.startDate}
              x={barX} y={barTop}
              width={barW} height={barH}
              fill="#FF6B6B" rx="2"
            />
          );
        })}

        {/* Median reference line */}
        {medianPeriodLength !== null && (() => {
          const medY = toSvgY(medianPeriodLength);
          const labelY = medY - 6;
          return (
            <g>
              <line
                x1={PLOT_X1} y1={medY} x2={PLOT_X2} y2={medY}
                stroke="#2D2A32" strokeOpacity="0.4" strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x={PLOT_X2} y={labelY}
                textAnchor="end" dominantBaseline="middle"
                fontSize="10" fill="#2D2A32" fillOpacity="0.6"
              >
                Median: {medianPeriodLength}d
              </text>
            </g>
          );
        })()}

        {/* X-axis direction hint */}
        <text
          x={VIEW_W / 2} y={VIEW_H - 8}
          textAnchor="middle" fontSize="10"
          fill="#2D2A32" fillOpacity="0.5"
        >
          ← older newer →
        </text>

      </svg>
    </div>
  );
}
