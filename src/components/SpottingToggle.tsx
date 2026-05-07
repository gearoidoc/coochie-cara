interface Props {
  isSpotting: boolean;
  onToggle: () => void;
}

export default function SpottingToggle({ isSpotting, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] border ${
        isSpotting
          ? 'bg-sage text-white border-sage'
          : 'bg-cream text-sage border-sage'
      }`}
    >
      Just spotting today
    </button>
  );
}
