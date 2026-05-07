import type { FlowLevel } from '../types';

const FLOW_LEVELS: { value: FlowLevel; label: string }[] = [
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

interface Props {
  flow: FlowLevel;
  onSelect: (flow: FlowLevel) => void;
}

export default function FlowChips({ flow, onSelect }: Props) {
  return (
    <div>
      <p className="text-ink/70 font-semibold text-sm mt-6 mb-2">Flow</p>
      <div className="flex gap-2">
        {FLOW_LEVELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`rounded-full px-3 py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${
              flow === value ? 'bg-coral text-white' : 'bg-coral/10 text-coral'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
