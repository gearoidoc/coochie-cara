interface Props {
  onPeriod: boolean;
  onToggle: () => void;
}

export default function PeriodButton({ onPeriod, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`w-full rounded-2xl py-8 text-center text-xl font-extrabold transition-all active:scale-[0.98] ${
        onPeriod
          ? 'bg-coral text-white'
          : 'bg-cream border-2 border-coral text-coral'
      }`}
    >
      On my period 🩸
    </button>
  );
}
