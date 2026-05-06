import type { SymptomCatalogEntry } from '../db';

interface Props {
  symptom: SymptomCatalogEntry;
  mode: 'default' | 'enabled' | 'available' | 'available-disabled';
  onAction?: () => void;
}

export default function SymptomConfigRow({ symptom, mode, onAction }: Props) {
  return (
    <div className="w-full bg-cream border-2 border-coral/20 rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">{symptom.emoji}</span>
      <span className="flex-1 text-ink font-semibold">{symptom.label}</span>
      {mode === 'default' && (
        <span className="text-ink/40 text-xs font-medium">Default</span>
      )}
      {mode === 'enabled' && (
        <button
          onClick={onAction}
          className="w-7 h-7 rounded-full bg-coral/10 text-coralDark flex items-center justify-center active:scale-95 transition-all"
        >
          −
        </button>
      )}
      {(mode === 'available' || mode === 'available-disabled') && (
        <button
          onClick={onAction}
          className={`w-7 h-7 rounded-full bg-coral text-white flex items-center justify-center active:scale-95 transition-all ${
            mode === 'available-disabled' ? 'opacity-30 pointer-events-none' : ''
          }`}
        >
          +
        </button>
      )}
    </div>
  );
}
