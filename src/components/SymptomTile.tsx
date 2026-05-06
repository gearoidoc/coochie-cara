import type { Severity } from '../types';

interface SymptomMeta {
  id: string;
  label: string;
  emoji: string;
}

interface Props {
  symptom: SymptomMeta;
  severity: Severity | null;
  onTap: () => void;
}

const DOT_COUNT: Record<Severity, number> = {
  mild: 1,
  moderate: 2,
  severe: 3,
};

export default function SymptomTile({ symptom, severity, onTap }: Props) {
  const isActive = severity !== null;

  return (
    <div
      onClick={onTap}
      className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.97] cursor-pointer select-none min-h-[96px] border-2 ${
        isActive
          ? 'bg-coral/10 border-coral text-coralDark'
          : 'bg-cream border-coral/20 text-ink'
      }`}
    >
      <span className="text-3xl leading-none">{symptom.emoji}</span>
      <span className="text-sm font-semibold">{symptom.label}</span>
      {severity !== null && (
        <div className="flex gap-1 mt-1">
          {Array.from({ length: DOT_COUNT[severity] }).map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-coral block" />
          ))}
        </div>
      )}
    </div>
  );
}
